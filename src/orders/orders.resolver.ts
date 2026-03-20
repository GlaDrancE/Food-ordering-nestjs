import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [Order])
  @UseGuards(JwtAuthGuard)
  async myOrders(@CurrentUser() user: any) {
    return this.ordersService.myOrders(user);
  }

  @Query(() => Order)
  @UseGuards(JwtAuthGuard)
  async order(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.getOrderById(id, user);
  }

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard)
  async createOrderFromCart(@CurrentUser() user: any) {
    return this.ordersService.createOrderFromCart(user);
  }

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async checkoutOrder(
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('paymentMethodId', { type: () => Int }) paymentMethodId: number,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.checkoutOrder(orderId, paymentMethodId, user);
  }

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancelOrder(
    @Args('orderId', { type: () => Int }) orderId: number,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancelOrder(orderId, user);
  }
}
