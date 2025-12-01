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
  FundsTransferredWalletMessage,
  FundTransferInitiatedWalletMessage,
  FundsTransferFailedWalletMessage,
} from '../../../rabbitmq/messages';

const EXCHANGE = 'wallet_events';
enum RoutingKeys {
  WALLET_CREATED = 'wallet.created',
  WALLET_DEPOSIT = 'wallet.deposit',
  WALLET_WITHDRAW = 'wallet.withdraw',
  WALLET_TRANSFER = 'wallet.transfer',
  WALLET_TRANSFER_INITIATED = 'wallet.transfer-initiated',
  WALLET_TRANSFER_FAILED = 'wallet.transfer-failed',
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

  async publishTransferInitiatedMessage(
    message: FundTransferInitiatedWalletMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.FUNDS_TRANSFER_INITIATED,
      message,
    );

    await this.publishMessage(
      RoutingKeys.WALLET_TRANSFER_INITIATED,
      builder.getMessage(),
    );
  }

  async publishTransferFailedMessage(
    message: FundsTransferFailedWalletMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.FUNDS_TRANSFER_FAILED,
      message,
    );

    await this.publishMessage(
      RoutingKeys.WALLET_TRANSFER_FAILED,
      builder.getMessage(),
    );
  }

  async publishFundsTransferredMessage(
    message: FundsTransferredWalletMessage,
  ): Promise<void> {
    const builder = RabbitMQMessageBuilder.create(
      MessageType.FUNDS_TRANSFERRED,
      message,
    );

    await this.publishMessage(
      RoutingKeys.WALLET_TRANSFER,
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
