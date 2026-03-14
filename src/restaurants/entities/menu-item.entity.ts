import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  // Represent Decimal as string for simplicity
  @Field()
  price: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Int)
  restaurantId: number;
}

