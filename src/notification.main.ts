import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { NotificationModule } from './notification/notification.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NotificationModule);
  const logger = app.get(Logger);
  app.useLogger(logger);

  // no need to expose port
}
bootstrap();
