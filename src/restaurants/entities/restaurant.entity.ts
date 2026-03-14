import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Country } from '../../../generated/prisma/enums';
import { MenuItem } from './menu-item.entity';

@ObjectType()
export class Restaurant {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Country)
  country: Country;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [MenuItem])
  menuItems: MenuItem[];
}

