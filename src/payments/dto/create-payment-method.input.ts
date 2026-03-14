import { Field, InputType, Int } from '@nestjs/graphql';
import { PaymentType } from 'generated/prisma/enums';

@InputType()
export class CreatePaymentMethodInput {
  @Field(() => PaymentType)
  type: PaymentType;

  @Field(() => String, { nullable: true })
  last4?: string;

  @Field()
  provider: string;

  @Field(() => Int, { nullable: true })
  userIdOverride?: number;
}

