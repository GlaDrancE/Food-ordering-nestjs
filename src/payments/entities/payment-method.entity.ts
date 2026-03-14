import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentType } from 'generated/prisma/enums';

registerEnumType(PaymentType, { name: 'PaymentType' });

@ObjectType()
export class PaymentMethod {
  @Field(() => Int)
  id: number;

  @Field()
  userId: string;

  @Field(() => PaymentType)
  type: PaymentType;

  @Field(() => String, { nullable: true })
  last4?: string | null;

  @Field()
  provider: string;

  @Field()
  isDefault: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

