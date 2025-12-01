import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import { NotificationService } from './notification.service';
import type { RabbitMQMessage } from '../rabbitmq/messages';

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
  handleWalletEvent<T>(message: RabbitMQMessage<T>) {
    this.logger.info('Handling message notification o%', message);

    const email = `Notification for event type: ${message.type}`;
    this.notificationService.sendEmail(email);
  }
}
