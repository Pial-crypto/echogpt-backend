import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AdminService } from './admin.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/utils/guards/roles.guard.js';
import { Roles } from '../common/utils/decorators/roles.decorator.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
  })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
  })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('subscriptions')
  @ApiOperation({
    summary: 'Get all subscriptions',
  })
  getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Get('providers')
  @ApiOperation({
    summary: 'Get all AI providers',
  })
  getProviders() {
    return this.adminService.getProviders();
  }

  @Get('usage')
  @ApiOperation({
    summary: 'Get API usage analytics',
  })
  getUsage() {
    return this.adminService.getUsageAnalytics();
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get API request logs',
  })
  getLogs() {
    return this.adminService.getLogs();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Get system health',
  })
  getHealth() {
    return this.adminService.getSystemHealth();
  }
}