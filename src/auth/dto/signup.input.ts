import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { Role } from '../../../generated/prisma/enums';
import { Country } from '../../../generated/prisma/enums';

@InputType()
export class SignUpInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field(() => Role, {
    nullable: true,
    description: 'Defaults to MEMBER when not provided',
  })
  @IsEnum(Role)
  role?: Role;

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;
}
