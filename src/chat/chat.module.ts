import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ProvidersModule } from '../providers/providers.module.js';

@Module({
  imports: [
    ProvidersModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatService,
  ],
})
export class ChatModule {}