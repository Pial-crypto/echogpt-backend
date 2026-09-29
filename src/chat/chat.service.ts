import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { ProvidersService } from '../providers/providers.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {}

  async sendMessage(
    userId: string,
    dto: SendMessageDto,
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

    if (
      subscription.requestsUsed >=
      subscription.requestLimit
    ) {
      throw new BadRequestException(
        'Monthly request limit reached',
      );
    }

    let chat;

    if (dto.chatId) {
      chat = await this.prisma.chat.findFirst({
        where: {
          id: dto.chatId,
          userId,
        },
      });

      if (!chat) {
        throw new NotFoundException(
          'Chat not found',
        );
      }
    } else {
      chat = await this.prisma.chat.create({
        data: {
          userId,
          providerId:
            dto.providerId,
          model: dto.model,
          title: dto.message.slice(0, 100),
        },
      });
    }

    await this.prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'USER',
        content: dto.message,
      },
    });

    const previousMessages =
      await this.prisma.chatMessage.findMany({
        where: {
          chatId: chat.id,
        },

        orderBy: {
          createdAt: 'asc',
        },

        select: {
          role: true,
          content: true,
        },
      });

    const aiResponse =
      await this.providersService.generate(
        dto.providerId ??
          chat.providerId ??
          undefined,

        previousMessages.map(
          (message) => ({
            role:
              message.role === 'USER'
                ? 'user'
                : message.role === 'ASSISTANT'
                  ? 'assistant'
                  : 'system',

            content: message.content,
          }),
        ),

        dto.model ?? chat.model ?? undefined,
      );

    await this.prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'ASSISTANT',
        content: aiResponse.content,
        tokenCount:
          aiResponse.tokensUsed,
      },
    });

    await this.prisma.subscription.update({
      where: {
        userId,
      },
      data: {
        requestsUsed: {
          increment: 1,
        },
      },
    });

    return {
      chatId: chat.id,
      provider: dto.providerId
        ? dto.providerId
        : chat.providerId,
      model: aiResponse.model,
      message: aiResponse.content,
      tokensUsed:
        aiResponse.tokensUsed ?? null,
    };
  }

  async getChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        userId,
      },

      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            defaultModel: true,
          },
        },

        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getChat(
    userId: string,
    chatId: string,
  ) {
    const chat =
      await this.prisma.chat.findFirst({
        where: {
          id: chatId,
          userId,
        },

        include: {
          provider: {
            select: {
              id: true,
              name: true,
              type: true,
              defaultModel: true,
            },
          },

          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found',
      );
    }

    return chat;
  }

  async deleteChat(
    userId: string,
    chatId: string,
  ) {
    const chat =
      await this.prisma.chat.findFirst({
        where: {
          id: chatId,
          userId,
        },
      });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found',
      );
    }

    await this.prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return {
      message: 'Chat deleted successfully',
    };
  }
}