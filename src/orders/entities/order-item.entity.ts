import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuItem } from '../../restaurants/entities/menu-item.entity';

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  orderId: number;

  @Field(() => Int)
  menuItemId: number;

  @Field(() => Int)
  quantity: number;

  // Represent Decimal as string for simplicity
  @Field()
  unitPrice: string;

  @Field(() => MenuItem)
  menuItem: MenuItem;
}
