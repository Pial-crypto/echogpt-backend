import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
      subscription: true,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    isActive: user.isActive,
    role: user.role.name,
    subscription: user.subscription,
    createdAt: user.createdAt,
  };
}
async refresh(refreshToken: string) {
  let payload: { sub: string };

  try {
    payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  } catch {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  const sessions = await this.prisma.session.findMany({
    where: {
      userId: payload.sub,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  let validSession: (typeof sessions)[number] | null = null;

  for (const session of sessions) {
    const matches = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );

    if (matches) {
      validSession = session;
      break;
    }
  }

  if (!validSession) {
    throw new UnauthorizedException(
      'Invalid or expired refresh token',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    include: {
      role: true,
      subscription: true,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException('User is inactive or not found');
  }

  // Token rotation
  await this.prisma.session.delete({
    where: {
      id: validSession.id,
    },
  });

  return this.createAuthResponse(user);
}

async logout(refreshToken: string) {
  let payload: { sub: string };

  try {
    payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  } catch {
    return {
      message: 'Logged out successfully',
    };
  }

  const sessions = await this.prisma.session.findMany({
    where: {
      userId: payload.sub,
    },
  });

  for (const session of sessions) {
    const matches = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );

    if (matches) {
      await this.prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      break;
    }
  }

  return {
    message: 'Logged out successfully',
  };
}
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const userRole = await this.prisma.role.findUnique({
      where: {
        name: 'USER',
      },
    });

    if (!userRole) {
      throw new ConflictException('Default user role is not configured');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: userRole.id,

        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            requestLimit: 50,
          },
        },
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.createAuthResponse(user);
  }

  private async createAuthResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        subscription: user.subscription,
      },
      accessToken,
      refreshToken,
    };
  }
}