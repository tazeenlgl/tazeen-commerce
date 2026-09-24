import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';

describe('App bootstrap', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication<NestExpressApplication>({ bodyParser: false });
    setupApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  it('GET /api/health returns ok without DB', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('sets security headers', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns consistent JSON error for unknown route', async () => {
    const res = await request(app.getHttpServer()).get('/api/nope').expect(404);
    expect(res.body).toEqual(expect.objectContaining({ statusCode: 404, path: '/api/nope' }));
  });
});
