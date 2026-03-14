import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country } from '../../generated/prisma/enums';
import { Role } from '../../generated/prisma/enums';
import { OrderStatus } from '../common/enums/order-status.enum';

interface CurrentUser {
  id: string;
  country: Country;
  role: Role;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async myOrders(user: CurrentUser) {
    return this.prisma.order.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(id: number, user: CurrentUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.userId === (user.id as any);
    const isPrivileged =
      (user.role === Role.ADMIN || user.role === Role.MANAGER) && order.country === user.country;

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You cannot access this order');
    }

    return order;
  }

  async createOrderFromCart(user: CurrentUser) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: user.id as any,
        country: user.country,
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ForbiddenException('Cart is empty');
    }

    for (const item of cart.items) {
      if (item.menuItem.restaurant.country !== user.country) {
        throw new ForbiddenException('Cart contains items from another country');
      }
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      const priceNumber = Number(item.menuItem.price);
      return sum + priceNumber * item.quantity;
    }, 0);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: {
            connect: { id: user.id as any },
          },
          country: user.country,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.menuItem.price,
            })),
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

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async checkoutOrder(orderId: number, paymentMethodId: number, user: CurrentUser) {
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new ForbiddenException('Only admins and managers can checkout orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.country !== user.country) {
      throw new ForbiddenException('You cannot checkout orders from another country');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('Only pending orders can be checked out');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Mock payment processing
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          status: 'SUCCESS' as any,
          providerRef: `mock-${Date.now()}`,
          paymentMethodId: paymentMethodId
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    });
  }

  async cancelOrder(orderId: number, user: CurrentUser) {
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new ForbiddenException('Only admins and managers can cancel orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.country !== user.country) {
      throw new ForbiddenException('You cannot cancel orders from another country');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ForbiddenException('Order is already cancelled');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
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
}

