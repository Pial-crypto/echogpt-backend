import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { describe, beforeAll, afterAll, it } from 'vitest';

import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/register (POST) - validation', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);
  });

  it('/api/auth/login (POST) - invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  it('/api/users/me (GET) - requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/users/me')
      .expect(401);
  });

  it('/api/subscriptions/me (GET) - requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/subscriptions/me')
      .expect(401);
  });

  it('/api/chat (POST) - requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/chat')
      .send({
        message: 'Hello',
      })
      .expect(401);
  });

  it('/api/search (POST) - requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/search')
      .send({
        query: 'NestJS',
      })
      .expect(401);
  });
});