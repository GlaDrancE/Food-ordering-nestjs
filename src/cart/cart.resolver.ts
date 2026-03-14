import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myCart(@CurrentUser() user: any) {
    return this.cartService.getMyCart(user);
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Args('menuItemId', { type: () => Int }) menuItemId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.addToCart(user, menuItemId, quantity);
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @Args('cartItemId', { type: () => Int }) cartItemId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.updateCartItem(user, cartItemId, quantity);
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async removeCartItem(
    @Args('cartItemId', { type: () => Int }) cartItemId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.removeCartItem(user, cartItemId);
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user);
  }
}

