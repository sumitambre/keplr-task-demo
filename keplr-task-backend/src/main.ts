import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useLogger(app.get(PinoLogger));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
