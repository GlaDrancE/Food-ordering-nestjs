import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Country } from '../../../generated/prisma/enums';
import { CartItem } from './cart-item.entity';

@ObjectType()
export class Cart {
  @Field(() => Int)
  id: number;

  @Field()
  userId: string;

  @Field(() => Country)
  country: Country;

  @Field(() => [CartItem])
  items: CartItem[];

  @Field(() => Boolean)
  sharable: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class SharableCart {
  @Field(() => Cart)
  cart: Cart;

  @Field(() => [Cart])
  sharableCart: Cart[];
}
