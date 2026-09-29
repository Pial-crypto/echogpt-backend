import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnthropicAdapter } from './adapter/anthropic.adapter.js';
import { OpenAIAdapter } from './adapter/openai.adapter.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { encrypt,decrypt } from '../utils/encryption.util.js';
import { ProviderType } from '@prisma/client';
import { AIProviderAdapter,GenerateResponseInput } from './adapter/ai-provider.interface.js';
import { CreateProviderDto } from './dto/create-provider.dto.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';
import { GeminiAdapter } from './adapter/gemini.adapter.js';
@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async generate(
  providerId: string | undefined,
  messages: GenerateResponseInput['messages'],
  requestedModel?: string,
) {
  let provider;

  if (providerId) {
    provider =
      await this.prisma.aIProvider.findUnique({
        where: {
          id: providerId,
        },
      });
  } else {
    provider =
      await this.prisma.aIProvider.findFirst({
        where: {
          isDefault: true,
          isEnabled: true,
        },
      });
  }

  if (!provider) {
    throw new NotFoundException(
      'No active AI provider available',
    );
  }

  if (!provider.isEnabled) {
    throw new BadRequestException(
      'AI provider is disabled',
    );
  }

  const apiKey = decrypt(provider.apiKey);

  const model =
    requestedModel ??
    provider.defaultModel;

  if (!model) {
    throw new BadRequestException(
      'AI model is not configured',
    );
  }

  const adapter =
    this.getAdapter(provider.type);

  return adapter.generate({
    apiKey,
    model,
    messages,
    baseUrl: provider.baseUrl ?? undefined,
  });
}

private getAdapter(
  type: ProviderType,
): AIProviderAdapter {
  switch (type) {
    case ProviderType.OPENAI:
      return new OpenAIAdapter();

    case ProviderType.ANTHROPIC:
      return new AnthropicAdapter();

    case ProviderType.GEMINI:
      return new GeminiAdapter();

    default:
      throw new BadRequestException(
        'Unsupported AI provider',
      );
  }
}

  async create(dto: CreateProviderDto) {
    if (dto.isDefault) {
      await this.prisma.aIProvider.updateMany({
        where: {
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const provider =
      await this.prisma.aIProvider.create({
        data: {
          name: dto.name,
          type: dto.type,
          apiKey: encrypt(dto.apiKey),
          baseUrl: dto.baseUrl,
          defaultModel: dto.defaultModel,
          isEnabled: dto.isEnabled ?? true,
          isDefault: dto.isDefault ?? false,
        },
      });

    return this.sanitizeProvider(provider);
  }

  async findAll() {
    const providers =
      await this.prisma.aIProvider.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

    return providers.map((provider) =>
      this.sanitizeProvider(provider),
    );
  }

  async findOne(id: string) {
    const provider =
      await this.prisma.aIProvider.findUnique({
        where: {
          id,
        },
      });

    if (!provider) {
      throw new NotFoundException(
        'AI provider not found',
      );
    }

    return this.sanitizeProvider(provider);
  }

  async update(
    id: string,
    dto: UpdateProviderDto,
  ) {
    const existing =
      await this.prisma.aIProvider.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'AI provider not found',
      );
    }

    if (dto.isDefault) {
      await this.prisma.aIProvider.updateMany({
        where: {
          id: {
            not: id,
          },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const data: any = {
      name: dto.name,
      type: dto.type,
      baseUrl: dto.baseUrl,
      defaultModel: dto.defaultModel,
      isEnabled: dto.isEnabled,
      isDefault: dto.isDefault,
    };

    if (dto.apiKey) {
      data.apiKey = encrypt(dto.apiKey);
    }

    const provider =
      await this.prisma.aIProvider.update({
        where: {
          id,
        },
        data,
      });

    return this.sanitizeProvider(provider);
  }

  async remove(id: string) {
    const provider =
      await this.prisma.aIProvider.findUnique({
        where: {
          id,
        },
      });

    if (!provider) {
      throw new NotFoundException(
        'AI provider not found',
      );
    }

    await this.prisma.aIProvider.delete({
      where: {
        id,
      },
    });

    return {
      message: 'AI provider deleted successfully',
    };
  }

  async toggle(id: string, enabled: boolean) {
    const provider =
      await this.prisma.aIProvider.update({
        where: {
          id,
        },
        data: {
          isEnabled: enabled,
        },
      });

    return this.sanitizeProvider(provider);
  }

  async setDefault(id: string) {
    const provider =
      await this.prisma.aIProvider.findUnique({
        where: {
          id,
        },
      });

    if (!provider) {
      throw new NotFoundException(
        'AI provider not found',
      );
    }

    await this.prisma.aIProvider.updateMany({
      data: {
        isDefault: false,
      },
    });

    const updated =
      await this.prisma.aIProvider.update({
        where: {
          id,
        },
        data: {
          isDefault: true,
        },
      });

    return this.sanitizeProvider(updated);
  }

  async healthCheck(id: string) {
    const provider =
      await this.prisma.aIProvider.findUnique({
        where: {
          id,
        },
      });

    if (!provider) {
      throw new NotFoundException(
        'AI provider not found',
      );
    }

    const apiKey = decrypt(provider.apiKey);

    return {
      provider: provider.name,
      type: provider.type,
      enabled: provider.isEnabled,
      configured: Boolean(apiKey),
      status: provider.isEnabled
        ? 'READY'
        : 'DISABLED',
    };
  }

  private sanitizeProvider(provider: any) {
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      baseUrl: provider.baseUrl,
      defaultModel: provider.defaultModel,
      isEnabled: provider.isEnabled,
      isDefault: provider.isDefault,


      hasApiKey: Boolean(provider.apiKey),

      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}