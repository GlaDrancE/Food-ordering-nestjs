import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class Payment {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  orderId: number;

  // Represent Decimal as string
  @Field()
  amount: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field()
  providerRef: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
