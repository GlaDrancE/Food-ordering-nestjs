import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Cart, SharableCart } from './entities/cart.entity';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => SharableCart)
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

  @Mutation(() => Cart)
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('status', { type: () => Boolean }) status: boolean,
    @CurrentUser() user: any,
  ) {
    return this.cartService.changeCartStatus(user, cartId, status);
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

  @Mutation(() => Cart)
  @UseGuards(JwtAuthGuard)
  async addToSharableCart(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('menuItemId', { type: () => Int }) menuItemId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.addToSharableCart(
      user,
      cartId,
      menuItemId,
      quantity,
    );
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updateSharableCartItem(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('cartItemId', { type: () => Int }) cartItemId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.updateSharableCartItem(
      user,
      cartId,
      cartItemId,
      quantity,
    );
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async removeSharableCartItem(
    @Args('cartId', { type: () => Int }) cartId: number,
    @Args('cartItemId', { type: () => Int }) cartItemId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.removeSharableCartItem(user, cartId, cartItemId);
  }

  @Mutation(() => Cart, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async clearSharableCart(
    @Args('cartId', { type: () => Int }) cartId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.clearSharableCart(user, cartId);
  }
}
