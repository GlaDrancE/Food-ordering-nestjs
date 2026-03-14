import { Field, HideField, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '../../../generated/prisma/enums';
import { Country } from '../../../generated/prisma/enums';

registerEnumType(Role, { name: 'Role' });
registerEnumType(Country, { name: 'Country' });

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @HideField()
  passwordHash: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Country)
  country: Country;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

