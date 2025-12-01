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
  data: T;
};

export class RabbitMQMessageBuilder<T> {
  private readonly message: RabbitMQMessage<T>;

  constructor(type: MessageType, data: T) {
    this.message = { type, data };
  }

  getMessage(): RabbitMQMessage<T> {
    return this.message;
  }

  static create<U>(type: MessageType, data: U): RabbitMQMessageBuilder<U> {
    return new RabbitMQMessageBuilder(type, data);
  }
}
