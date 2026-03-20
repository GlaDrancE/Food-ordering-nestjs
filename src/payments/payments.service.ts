import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country } from '../../generated/prisma/enums';
import { Role } from '../../generated/prisma/enums';
import { PaymentStatus } from '../common/enums/payment-status.enum';

interface CurrentUser {
  id: string;
  role: Role;
  country: Country;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertAdmin(user: CurrentUser) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can manage payment methods');
    }
  }

  async listPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async createPaymentMethod(input: {
    type: string;
    last4?: string;
    provider: string;
    userId?: string;
  }) {
    return this.prisma.paymentMethod.create({
      data: {
        type: input.type as any,
        last4: input.last4,
        provider: input.provider,
        userId: input.userId ?? 'admin',
      },
    });
  }

  async updatePaymentMethod(
    id: number,
    input: { type?: string; last4?: string; provider?: string },
  ) {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Payment method not found');
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: {
        type: input.type ?? (existing.type as any),
        last4: input.last4 ?? existing.last4,
        provider: input.provider ?? existing.provider,
      },
    });
  }

  async deletePaymentMethod(id: number) {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Payment method not found');
    }

    await this.prisma.paymentMethod.delete({ where: { id } });
    return true;
  }
}
