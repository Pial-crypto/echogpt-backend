import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { ProvidersModule } from './providers/providers.module.js';
import { AdminModule } from './admin/admin.module.js';
import { ChatModule } from './chat/chat.module.js';
import { SearchModule } from './search/search.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    ProvidersModule,
    AdminModule,
    ChatModule,
    SearchModule,
  ],
})
export class AppModule {}