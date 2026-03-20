import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country } from '../../generated/prisma/enums';

interface CurrentUser {
  id: string;
  country: Country;
}

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(user: CurrentUser) {
    return this.prisma.restaurant.findMany({
      where: {
        country: user.country,
        isActive: true,
      },
      include: {
        menuItems: true,
      },
    });
  }

  async findOneForUser(id: number, user: CurrentUser) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!restaurant || restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot access this restaurant');
    }

    return restaurant;
  }

  async menuItemsByRestaurant(restaurantId: number, user: CurrentUser) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot access this restaurant');
    }

    return this.prisma.menuItem.findMany({
      where: { restaurantId },
    });
  }
}
