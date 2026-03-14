import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePaymentMethodInput } from './dto/create-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Query(() => [PaymentMethod])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async paymentMethods() {
    return this.paymentsService.listPaymentMethods();
  }

  @Mutation(() => PaymentMethod)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createPaymentMethod(
    @Args('input') input: CreatePaymentMethodInput,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.createPaymentMethod({
      type: input.type,
      last4: input.last4,
      provider: input.provider,
      userId: user.id,
    });
  }

  @Mutation(() => PaymentMethod)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(@Args('input') input: UpdatePaymentMethodInput) {
    return this.paymentsService.updatePaymentMethod(input.id, {
      type: input.type,
      last4: input.last4,
      provider: input.provider,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(@Args('id', { type: () => Int }) id: number) {
    return this.paymentsService.deletePaymentMethod(id);
  }
}