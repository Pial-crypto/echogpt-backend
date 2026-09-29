import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SearchDto } from './dto/search.dto.js';
import { TavilyService } from './tavily.service.js';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tavilyService: TavilyService,
  ) {}

  async search(userId: string, dto: SearchDto) {
    const search = await this.prisma.webSearch.create({
      data: {
        userId,
        query: dto.query,
        status: 'PENDING',
      },
    });

    try {
      const searchResult = await this.performSearch(
        dto.query,
        dto.limit ?? 10,
      );

      const results = searchResult.results;
      const resultCount = searchResult.resultCount;

      const updated = await this.prisma.webSearch.update({
        where: {
          id: search.id,
        },
        data: {
          status: 'COMPLETED',
          results,
          resultCount,
        },
      });

      return {
        id: updated.id,
        query: updated.query,
        answer: searchResult.answer,
        results,
        resultCount: updated.resultCount,
        createdAt: updated.createdAt,
      };
    } catch (error) {
      await this.prisma.webSearch.update({
        where: {
          id: search.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

  async getHistory(userId: string) {
    return this.prisma.webSearch.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        query: true,
        status: true,
        resultCount: true,
        createdAt: true,
      },
    });
  }

  async getRecent(userId: string) {
    return this.prisma.webSearch.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        query: true,
        resultCount: true,
        createdAt: true,
      },
    });
  }

  async getSuggestions(
    userId: string,
    query?: string,
  ) {
    const searches = await this.prisma.webSearch.findMany({
      where: {
        userId,

        ...(query
          ? {
              query: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : {}),
      },

      select: {
        query: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: 20,
    });

    const uniqueQueries = [
      ...new Set(
        searches.map((search) => search.query),
      ),
    ];

    return {
      suggestions: uniqueQueries,
    };
  }

  private async performSearch(
    query: string,
    limit: number,
  ) {
    const result = await this.tavilyService.search(
      query,
      limit,
    );

    return {
      answer: result.answer,
      results: result.results,
      resultCount: result.results.length,
    };
  }
}