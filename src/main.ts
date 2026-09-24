import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { JsonLogger } from './common/logging/json-logger';
import configuration from './config/configuration';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new JsonLogger(),
    bodyParser: false, // configured with limits in setupApp
  });
  setupApp(app);
  const { port } = configuration();
  const { security } = configuration();
  const server = await app.listen(port);
  // Connection protection: bound slow/idle connections.
  server.maxConnections = security.maxConnections;
  server.requestTimeout = security.requestTimeoutMs + 5000;
  server.headersTimeout = 20000;
  server.keepAliveTimeout = 5000;
}
bootstrap();
