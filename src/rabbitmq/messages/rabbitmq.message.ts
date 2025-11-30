export enum MessageType {
  WALLET_CREATED = 'WALLET_CREATED',
  WALLEt_DEPOSIT = 'WALLET_DEPOSIT',
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
