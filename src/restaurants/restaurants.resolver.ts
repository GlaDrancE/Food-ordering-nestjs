import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant])
  @UseGuards(JwtAuthGuard)
  async restaurants(@CurrentUser() user: any) {
    return this.restaurantsService.findAllForUser(user);
  }

  @Query(() => Restaurant)
  @UseGuards(JwtAuthGuard)
  async restaurant(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: any,
  ) {
    return this.restaurantsService.findOneForUser(id, user);
  }

  @Query(() => [MenuItem])
  @UseGuards(JwtAuthGuard)
  async menuItemsByRestaurant(
    @Args('restaurantId', { type: () => Int }) restaurantId: number,
    @CurrentUser() user: any,
  ) {
    return this.restaurantsService.menuItemsByRestaurant(restaurantId, user);
  }
}
