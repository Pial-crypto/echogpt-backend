import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SearchDto } from './dto/search.dto.js';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async search(
    userId: string,
    dto: SearchDto,
  ) {
    const startTime = Date.now();

    const search = await this.prisma.webSearch.create({
      data: {
        userId,
        query: dto.query,
        status: 'PENDING',
      },
    });

    try {


      const results = await this.performSearch(
        dto.query,
        dto.limit ?? 10,
      );

      const updated =
        await this.prisma.webSearch.update({
          where: {
            id: search.id,
          },
          data: {
            status: 'COMPLETED',
            results,
            resultCount: results.length,
          },
        });

      await this.prisma.apiUsageLog.create({
        data: {
          userId,
          endpoint: '/api/search',
          method: 'POST',
          statusCode: 200,
          responseTime:
            Date.now() - startTime,
        },
      });

      return {
        id: updated.id,
        query: updated.query,
        results,
        resultCount:
          updated.resultCount,
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

      await this.prisma.apiUsageLog.create({
        data: {
          userId,
          endpoint: '/api/search',
          method: 'POST',
          statusCode: 500,
          responseTime:
            Date.now() - startTime,
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
    const searches =
      await this.prisma.webSearch.findMany({
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
        searches.map(
          (search) => search.query,
        ),
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
    /*
     * Temporary development implementation.
     *
     * Replace this method with a real web-search
     * provider such as Tavily, Serper, Bing, etc.
     */

    return [
      {
        title: `Search result for: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(
          query,
        )}`,
        snippet:
          'Web search provider integration can be connected here.',
      },
    ].slice(0, limit);
  }
}