import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { ChangePlanDto, ChangePlan } from './dto/change-plan.dto.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getMySubscription(userId: string) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          userId,
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    return this.formatSubscription(subscription);
  }

  async changePlan(
    userId: string,
    dto: ChangePlanDto,
  ) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          userId,
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.plan === dto.plan) {
      throw new BadRequestException(
        `You are already on the ${dto.plan} plan`,
      );
    }

    const isPremium =
      dto.plan === ChangePlan.PREMIUM;

    const updated =
      await this.prisma.subscription.update({
        where: {
          userId,
        },
        data: {
          plan: dto.plan,
          status: 'ACTIVE',

          // Example limits for the assignment.
          requestLimit: isPremium ? 1000 : 50,

          // Reset usage when plan changes.
          requestsUsed: 0,

          startedAt: new Date(),

          expiresAt: isPremium
            ? new Date(
                Date.now() +
                  30 * 24 * 60 * 60 * 1000,
              )
            : null,
        },
      });

    return {
      message: `Subscription changed to ${dto.plan}`,
      subscription:
        this.formatSubscription(updated),
    };
  }

  async getUsage(userId: string) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          userId,
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    const remainingRequests = Math.max(
      subscription.requestLimit -
        subscription.requestsUsed,
      0,
    );

    return {
      plan: subscription.plan,
      status: subscription.status,
      requestLimit: subscription.requestLimit,
      requestsUsed: subscription.requestsUsed,
      remainingRequests,
      usagePercentage:
        subscription.requestLimit > 0
          ? Number(
              (
                (subscription.requestsUsed /
                  subscription.requestLimit) *
                100
              ).toFixed(2),
            )
          : 0,
    };
  }

  private formatSubscription(
    subscription: any,
  ) {
    return {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      requestLimit:
        subscription.requestLimit,
      requestsUsed:
        subscription.requestsUsed,
      remainingRequests: Math.max(
        subscription.requestLimit -
          subscription.requestsUsed,
        0,
      ),
      startedAt:
        subscription.startedAt,
      expiresAt:
        subscription.expiresAt,
      createdAt:
        subscription.createdAt,
      updatedAt:
        subscription.updatedAt,
    };
  }
}