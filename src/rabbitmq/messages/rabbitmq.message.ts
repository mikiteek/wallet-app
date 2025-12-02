export enum MessageType {
  WALLET_CREATED = 'WALLET_CREATED',
  FUNDS_DEPOSITED = 'FUNDS_DEPOSITED',
  FUNDS_WITHDRAWN = 'FUNDS_WITHDRAWN',
  FUNDS_TRANSFERRED = 'FUNDS_TRANSFERRED',
  FUNDS_TRANSFER_INITIATED = 'FUNDS_TRANSFER_INITIATED',
  FUNDS_TRANSFER_FAILED = 'FUNDS_TRANSFER_FAILED',
}

export type RabbitMQMessage<T> = {
  type: MessageType;
  messageId: string;
  data: T;
};

export class RabbitMQMessageBuilder<T> {
  constructor(
    private readonly type: MessageType,
    private readonly data: T,
    private readonly messageId: string = crypto.randomUUID(),
  ) {}

  getMessage(): RabbitMQMessage<T> {
    return {
      type: this.type,
      messageId: this.messageId,
      data: this.data,
    };
  }

  static create<U>(
    type: MessageType,
    data: U,
    messageId = crypto.randomUUID(),
  ): RabbitMQMessageBuilder<U> {
    return new RabbitMQMessageBuilder(type, data, messageId);
  }
}
