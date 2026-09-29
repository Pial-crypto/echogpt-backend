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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsageLoggingInterceptor } from './common/utils/interceptors/usage-logging.interceptor.js';
// import { UsageLoggingInterceptor } from './common/interceptors/usage-logging.interceptor';
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
    ThrottlerModule.forRoot([
  {
    ttl: 60000,
    limit: 60,
  },
]),
  ],
  providers: [
  {
    provide: APP_INTERCEPTOR,
    useClass: UsageLoggingInterceptor,
  },
  {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
},
],
})
export class AppModule {}