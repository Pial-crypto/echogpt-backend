import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Send a message to an AI provider',
  })
  sendMessage(
    @Req() req: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      req.user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get conversation history',
  })
  getChats(@Req() req: any) {
    return this.chatService.getChats(
      req.user.userId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a conversation',
  })
  @ApiParam({
    name: 'id',
  })
  getChat(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.chatService.getChat(
      req.user.userId,
      id,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a conversation',
  })
  deleteChat(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.chatService.deleteChat(
      req.user.userId,
      id,
    );
  }
}