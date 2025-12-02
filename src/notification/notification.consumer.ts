import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.entity';
import type { RabbitMQMessage } from '../rabbitmq/messages';
import { NotificationAlreadyExistsError } from './errors';

@Injectable()
export class NotificationConsumer {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: PinoLogger,
  ) {}

  @RabbitSubscribe({
    exchange: 'wallet_events',
    routingKey: 'wallet.#',
    queue: 'wallet-events-queue',
  })
  async handleWalletEvent<T>(message: RabbitMQMessage<T>) {
    const { messageId, type: messageType } = message;

    // Mock some notification content
    // In reality, we customize title and text based on message content
    const title = `Event ${messageType}`;
    const text = `Be informed about event with your wallet ${messageType}`;
    try {
      await this.notificationService.persistNotification(
        messageId,
        NotificationType.EMAIL,
        title,
        text,
      );
      await this.notificationService.sendEmail(title, text);
    } catch (error) {
      if (error instanceof NotificationAlreadyExistsError) {
        this.logger.warn(
          `Notification already exists for messageId=${messageId}, skipping email sending.`,
        );
      }

      this.logger.error(error);
    }
  }
}
