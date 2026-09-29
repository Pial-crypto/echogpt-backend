import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ProvidersService } from './providers.service.js';
import { CreateProviderDto } from './dto/create-provider.dto.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/utils/guards/roles.guard.js';
import { Roles } from '../common/utils/decorators/roles.decorator.js';
@ApiTags('AI Providers')
@ApiBearerAuth()
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('ADMIN')
@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Add AI provider',
  })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List AI providers',
  })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get AI provider',
  })
  @ApiParam({
    name: 'id',
  })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update AI provider',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete AI provider',
  })
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Enable or disable AI provider',
  })
  @ApiQuery({
    name: 'enabled',
    type: Boolean,
    example: true,
  })
  toggle(
    @Param('id') id: string,
    @Query('enabled') enabled: string,
  ) {
    return this.providersService.toggle(
      id,
      enabled === 'true',
    );
  }

  @Patch(':id/default')
  @ApiOperation({
    summary: 'Set default AI provider',
  })
  setDefault(@Param('id') id: string) {
    return this.providersService.setDefault(id);
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Check AI provider health',
  })
  healthCheck(@Param('id') id: string) {
    return this.providersService.healthCheck(id);
  }
}