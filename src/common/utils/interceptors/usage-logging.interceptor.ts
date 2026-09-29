import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service.js';
@Injectable()
export class UsageLoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();

   
    if (request.originalUrl?.startsWith('/api/docs')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          void this.createLog(
            request,
            response,
            startTime,
            response.statusCode,
          );
        },

        error: (error) => {
          const statusCode =
            error instanceof HttpException
              ? error.getStatus()
              : 500;

          void this.createLog(
            request,
            response,
            startTime,
            statusCode,
          );
        },
      }),
    );
  }

  private async createLog(
    request: any,
    response: any,
    startTime: number,
    statusCode: number,
  ): Promise<void> {
    try {
      await this.prisma.apiUsageLog.create({
        data: {
          userId: request.user?.userId ?? null,
          endpoint: request.originalUrl ?? request.url,
          method: request.method,
          statusCode,
          responseTime: Date.now() - startTime,
          ipAddress: request.ip ?? null,
          userAgent: request.headers['user-agent'] ?? null,
        },
      });
    } catch {
    
    }
  }
}