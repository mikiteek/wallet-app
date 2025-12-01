import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [ConfigModule, LoggerModule, RabbitMQModule],
  controllers: [],
  providers: [NotificationService, NotificationConsumer],
})
export class NotificationModule {}
