import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Country } from '../../../generated/prisma/enums';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field()
  userId: string;

  @Field(() => Country)
  country: Country;

  @Field(() => OrderStatus)
  status: OrderStatus;

  // Represent Decimal as string
  @Field()
  totalAmount: string;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
