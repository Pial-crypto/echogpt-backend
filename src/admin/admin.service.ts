import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard() {
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalChats,
      totalSearches,
      totalProviders,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.subscription.count({
        where: {
          plan: 'PREMIUM',
          status: 'ACTIVE',
        },
      }),

      this.prisma.chat.count(),

      this.prisma.webSearch.count(),

      this.prisma.aIProvider.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive:
          totalUsers - activeUsers,
        premium: premiumUsers,
      },

      activity: {
        totalChats,
        totalSearches,
      },

      providers: {
        total: totalProviders,
      },
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        isActive: true,
        role: {
          select: {
            name: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            requestLimit: true,
            requestsUsed: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProviders() {
    return this.prisma.aIProvider.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        baseUrl: true,
        defaultModel: true,
        isEnabled: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageAnalytics() {
    const [
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens,
    ] = await Promise.all([
      this.prisma.apiUsageLog.count(),

      this.prisma.apiUsageLog.count({
        where: {
          statusCode: {
            gte: 200,
            lt: 400,
          },
        },
      }),

      this.prisma.apiUsageLog.count({
        where: {
          statusCode: {
            gte: 400,
          },
        },
      }),

      this.prisma.apiUsageLog.aggregate({
        _sum: {
          tokensUsed: true,
        },
      }),
    ]);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens:
        totalTokens._sum.tokensUsed ?? 0,
    };
  }

  async getLogs() {
    return this.prisma.apiUsageLog.findMany({
      take: 100,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        userId: true,
        endpoint: true,
        method: true,
        statusCode: true,
        provider: true,
        model: true,
        tokensUsed: true,
        responseTime: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  }

  async getSystemHealth() {
    let database = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'unhealthy';
    }

    return {
      status:
        database === 'healthy'
          ? 'healthy'
          : 'degraded',

      services: {
        database,
        api: 'healthy',
      },

      timestamp: new Date(),
    };
  }
}