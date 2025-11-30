import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import {
  MessageType,
  RabbitMQMessage,
  RabbitMQMessageBuilder,
  WalletCreatedMessage,
  FundsDepositedWalletMessage,
  FundsWithdrawnWalletMessage,
} from '../../../rabbitmq/messages';

const EXCHANGE = 'wallet_events';
enum RoutingKeys {
  WALLET_CREATED = 'wallet.created',
  WALLET_DEPOSIT = 'wallet.deposit',
  WALLET_WITHDRAW = 'wallet.withdraw',
}

@Injectable()
export class WalletPublisher {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly logger: PinoLogger,
  ) {}

  async publishWalletCreatedMessage(
    message: WalletCreatedMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.WALLET_CREATED,
      message,
    );

    await this.publishMessage(RoutingKeys.WALLET_CREATED, builder.getMessage());
  }

  async publishFundsDepositedMessage(
    message: FundsDepositedWalletMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.FUNDS_DEPOSITED,
      message,
    );

    await this.publishMessage(RoutingKeys.WALLET_DEPOSIT, builder.getMessage());
  }

  async publishFundsWithdrawnMessage(
    message: FundsWithdrawnWalletMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.FUNDS_WITHDRAWN,
      message,
    );

    await this.publishMessage(
      RoutingKeys.WALLET_WITHDRAW,
      builder.getMessage(),
    );
  }

  private async publishMessage<T>(
    routingKey: string,
    message: RabbitMQMessage<T>,
  ): Promise<void> {
    this.logger.debug(
      'Publishing RMQ message to exchange %s, with routing key %s: %o',
      EXCHANGE,
      routingKey,
      message,
    );

    try {
      await this.amqp.publish(EXCHANGE, routingKey, message);
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
