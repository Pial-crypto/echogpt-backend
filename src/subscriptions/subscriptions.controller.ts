import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SubscriptionsService } from './subscriptions.service.js';
import { ChangePlanDto } from './dto/change-plan.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current subscription',
  })
  @ApiResponse({
    status: 200,
    description:
      'Current subscription returned',
  })
  getMySubscription(@Req() req: any) {
    return this.subscriptionsService.getMySubscription(
      req.user.userId,
    );
  }

  @Patch('plan')
  @ApiOperation({
    summary: 'Upgrade or downgrade subscription',
  })
  @ApiResponse({
    status: 200,
    description:
      'Subscription plan changed',
  })
  changePlan(
    @Req() req: any,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(
      req.user.userId,
      dto,
    );
  }

  @Get('usage')
  @ApiOperation({
    summary: 'Get subscription usage',
  })
  @ApiResponse({
    status: 200,
    description:
      'Usage and remaining requests returned',
  })
  getUsage(@Req() req: any) {
    return this.subscriptionsService.getUsage(
      req.user.userId,
    );
  }
}