import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SearchService } from './search.service.js';
import { SearchDto } from './dto/search.dto.js';

@ApiTags('Web Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Perform a web search',
  })
  search(
    @Req() req: any,
    @Body() dto: SearchDto,
  ) {
    return this.searchService.search(
      req.user.userId,
      dto,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get search history',
  })
  getHistory(@Req() req: any) {
    return this.searchService.getHistory(
      req.user.userId,
    );
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent searches',
  })
  getRecent(@Req() req: any) {
    return this.searchService.getRecent(
      req.user.userId,
    );
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    example: 'nestjs',
  })
  getSuggestions(
    @Req() req: any,
    @Query('query') query?: string,
  ) {
    return this.searchService.getSuggestions(
      req.user.userId,
      query,
    );
  }
}