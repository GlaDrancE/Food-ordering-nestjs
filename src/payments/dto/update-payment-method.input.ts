import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreatePaymentMethodInput } from './create-payment-method.input';
import { PaymentType } from 'generated/prisma/enums';

@InputType()
export class UpdatePaymentMethodInput extends PartialType(
  CreatePaymentMethodInput,
) {
  @Field(() => Int)
  id: number;

  @Field(() => PaymentType, { nullable: true })
  type?: PaymentType;
}
