import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignUpInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { User as PrismaUser } from 'generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async signUp(input: SignUpInput): Promise<PrismaUser> {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const role = input.role ?? Role.MEMBER;

    return this.usersService.createUser({
      email: input.email,
      passwordHash,
      role,
      country: input.country,
    });
  }

  async validateUser(input: LoginInput): Promise<PrismaUser> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generateAccessToken(user: PrismaUser): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
    };

    return this.jwtService.signAsync(payload);
  }
}

