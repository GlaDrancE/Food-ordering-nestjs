import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country, Role } from '../../generated/prisma/enums';
import { SharableCart } from './entities/cart.entity';

interface CurrentUser {
  id: string;
  country: Country;
  role?: Role;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCart(cartData: any) {
    if (!cartData) return cartData;

    return {
      ...cartData,
      items: (cartData.items ?? []).map((item: any) => ({
        ...item,
        menuItem: {
          ...item.menuItem,
          // Prisma returns `Decimal`; GraphQL types expect `string` for money fields.
          price:
            item.menuItem?.price?.toString?.() ?? String(item.menuItem?.price),
        },
      })),
    };
  }

  private async getPersonalCart(user: CurrentUser) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId: user.id as any, country: user.country },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart) cart = await this.getOrCreateCart(user);
    return this.normalizeCart(cart);
  }

  private async getOrCreateCart(user: CurrentUser) {
    let cart = await this.prisma.cart.findFirst({
      where: {
        userId: user.id as any,
        country: user.country,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          country: user.country,
          user: {
            connect: { id: user.id as any },
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async getMyCart(user: CurrentUser): Promise<SharableCart> {
    const cart = await this.getPersonalCart(user);

    const sharableCart = await this.prisma.cart.findMany({
      where: {
        country: user.country,
        sharable: true,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return {
      cart: this.normalizeCart(cart),
      sharableCart: sharableCart.map((c) => this.normalizeCart(c)),
    };
  }

  async changeCartStatus(user: CurrentUser, cartId: number, status: boolean) {
    const updated = await this.prisma.cart.update({
      where: { id: cartId },
      data: { sharable: status },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    if (updated.country !== user.country) {
      throw new ForbiddenException(
        'You cannot update a cart from another country',
      );
    }

    // Only the owning user or admins/managers should be able to toggle sharable on/off.
    const isOwner = updated.userId === (user.id as any);
    const isPrivileged = user.role === Role.ADMIN || user.role === Role.MANAGER;
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You cannot update this cart');
    }

    return this.normalizeCart(updated);
  }

  private async getCartForSharableMutation(user: CurrentUser, cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.country !== user.country)
      throw new ForbiddenException('You cannot mutate this cart');
    if (!cart.sharable) throw new ForbiddenException('Cart is not sharable');

    return cart;
  }

  async addToSharableCart(
    user: CurrentUser,
    cartId: number,
    menuItemId: number,
    quantity: number,
  ) {
    if (quantity <= 0)
      throw new ForbiddenException('Quantity must be positive');

    const cart = await this.getCartForSharableMutation(user, cartId);

    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) throw new NotFoundException('Menu item not found');
    if (menuItem.restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot add items from another country');
    }

    // Prevent mixing restaurants within the same cart.
    const restaurantIds = new Set(
      (cart.items ?? [])
        .map((ci: any) => ci.menuItem?.restaurantId)
        .filter((v: any) => typeof v === 'number'),
    );
    if (restaurantIds.size > 0 && !restaurantIds.has(menuItem.restaurantId)) {
      throw new BadRequestException('Menu Item should be from Restaurant');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, menuItemId },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, menuItemId, quantity },
      });
    }

    const updatedCart = await this.getCartForSharableMutation(user, cartId);
    return this.normalizeCart(updatedCart);
  }

  async updateSharableCartItem(
    user: CurrentUser,
    cartId: number,
    cartItemId: number,
    quantity: number,
  ) {
    if (quantity <= 0)
      throw new ForbiddenException('Quantity must be positive');

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, menuItem: true },
    });

    if (!cartItem) throw new NotFoundException('Cart item not found');
    if (cartItem.cartId !== cartId)
      throw new ForbiddenException('You cannot modify this cart item');
    if (cartItem.cart.country !== user.country || !cartItem.cart.sharable) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const updatedCart = await this.getCartForSharableMutation(user, cartId);
    return this.normalizeCart(updatedCart);
  }

  async removeSharableCartItem(
    user: CurrentUser,
    cartId: number,
    cartItemId: number,
  ) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) throw new NotFoundException('Cart item not found');
    if (cartItem.cartId !== cartId)
      throw new ForbiddenException('You cannot modify this cart item');
    if (cartItem.cart.country !== user.country || !cartItem.cart.sharable) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    const updatedCart = await this.getCartForSharableMutation(user, cartId);
    return this.normalizeCart(updatedCart);
  }

  async clearSharableCart(user: CurrentUser, cartId: number) {
    await this.getCartForSharableMutation(user, cartId); // validates permissions
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    const updatedCart = await this.getCartForSharableMutation(user, cartId);
    return this.normalizeCart(updatedCart);
  }

  async addToCart(user: CurrentUser, menuItemId: number, quantity: number) {
    if (quantity <= 0) {
      throw new ForbiddenException('Quantity must be positive');
    }

    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (menuItem.restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot add items from another country');
    }

    const cart = await this.getOrCreateCart(user);

    const checkCart = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        menuItem: {
          select: {
            restaurantId: true,
          },
        },
      },
    });

    if (
      checkCart.length > 0 &&
      menuItem.restaurantId !== checkCart[0].menuItem.restaurantId
    ) {
      throw new BadRequestException('Menu Item should be from Restaurant');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        menuItemId,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
        },
      });
    }

    return this.getPersonalCart(user);
  }

  async updateCartItem(
    user: CurrentUser,
    cartItemId: number,
    quantity: number,
  ) {
    if (quantity <= 0) {
      throw new ForbiddenException('Quantity must be positive');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (
      cartItem.cart.userId !== (user.id as any) ||
      cartItem.cart.country !== user.country
    ) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getPersonalCart(user);
  }

  async removeCartItem(user: CurrentUser, cartItemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (
      cartItem.cart.userId !== (user.id as any) ||
      cartItem.cart.country !== user.country
    ) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getPersonalCart(user);
  }

  async clearCart(user: CurrentUser) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: user.id as any,
        country: user.country,
      },
    });

    if (!cart) {
      return null;
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getPersonalCart(user);
  }
}
