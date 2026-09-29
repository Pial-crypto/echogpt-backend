import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tavily } from '@tavily/core';

@Injectable()
export class TavilyService {
  private readonly client;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('TAVILY_API_KEY');

    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not configured');
    }

    this.client = tavily({
      apiKey,
    });
  }

  async search(query: string, limit = 10) {
    try {
      const response = await this.client.search(query, {
        maxResults: limit,
        searchDepth: 'basic',
        includeAnswer: true,
      });

      return {
        answer: response.answer ?? null,
        results: response.results.map((result) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score,
        })),
      };
    } catch {
      throw new InternalServerErrorException(
        'Web search provider failed',
      );
    }
  }
}