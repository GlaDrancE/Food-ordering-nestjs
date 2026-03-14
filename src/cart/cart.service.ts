import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country } from '../../generated/prisma/enums';

interface CurrentUser {
  id: string;
  country: Country;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

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

  async getMyCart(user: CurrentUser) {
    const cart = await this.prisma.cart.findFirst({
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

    return cart ?? null;
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

    return this.getMyCart(user);
  }

  async updateCartItem(user: CurrentUser, cartItemId: number, quantity: number) {
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

    if (cartItem.cart.userId !== (user.id as any) || cartItem.cart.country !== user.country) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getMyCart(user);
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

    if (cartItem.cart.userId !== (user.id as any) || cartItem.cart.country !== user.country) {
      throw new ForbiddenException('You cannot modify this cart item');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getMyCart(user);
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

    return this.getMyCart(user);
  }
}

