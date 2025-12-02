import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { MailModule } from './mail/mail.module';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';
import { NotificationRepository } from './notification.repository';
import { NotificationRabbitModule } from './rabbitmq/notification.rabbit.module';
import { NotificationEntity } from './notification.entity';
import { DatabaseModule } from '../database/typeorm.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    NotificationRabbitModule,
    MailModule,
    TypeOrmModule.forFeature([NotificationEntity]),
  ],
  controllers: [],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationConsumer,
  ],
})
export class NotificationModule {}
