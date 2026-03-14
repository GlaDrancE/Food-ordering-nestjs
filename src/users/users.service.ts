import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Country } from '../../generated/prisma/enums';
import { Role } from '../../generated/prisma/enums';
import { User as PrismaUser } from 'generated/prisma/client';

interface CreateUserParams {
  email: string;
  passwordHash: string;
  role: Role;
  country: Country;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(params: CreateUserParams): Promise<PrismaUser> {
    const { email, passwordHash, role, country } = params;

    return await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        country,
      },
    });
  }
}

