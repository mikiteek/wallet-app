import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import {
  MessageType,
  RabbitMQMessageBuilder,
  RabbitMQMessage,
  WalletCreatedMessage,
} from '../../../rabbitmq/messages';

@Injectable()
export class WalletPublisher {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly logger: PinoLogger,
  ) {}

  async publishWalletCreatedMessage(message: WalletCreatedMessage) {
    const exchange = 'wallet_events';
    const routingKey = 'wallet.created';
    const builder = RabbitMQMessageBuilder.create(
      MessageType.WALLET_CREATED,
      message,
    );

    await this.publishMessage(exchange, routingKey, builder.getMessage());
  }

  private async publishMessage<T>(
    exchange: string,
    routingKey: string,
    message: RabbitMQMessage<T>,
  ) {
    this.logger.debug(
      'Publishing RMQ message to exchange %s, with routing key %s: %o',
      exchange,
      routingKey,
      message,
    );

    try {
      await this.amqp.publish('wallet_events', 'wallet.created', message);
      this.logger.info(
        'Successfully published wallet.created message %o:',
        message,
      );
    } catch (error) {
      this.logger.error(
        'Error occurred while publishing RMQ message: %o',
        error,
      );
    }
  }
}
