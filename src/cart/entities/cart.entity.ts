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

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

