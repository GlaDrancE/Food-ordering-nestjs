import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuItem } from '../../restaurants/entities/menu-item.entity';

@ObjectType()
export class CartItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  cartId: number;

  @Field(() => Int)
  menuItemId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => MenuItem)
  menuItem: MenuItem;
}

