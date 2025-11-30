import { Module } from '@nestjs/common';
import { RabbitMQModule as RabbitMQUpModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQUpModule.forRoot({
      uri: 'amqp://guest:guest@localhost:5672', // TODO refactor to get values from config
      exchanges: [
        {
          name: 'wallet_events',
          type: 'topic',
        },
      ],
      queues: [
        {
          name: 'wallet-events-queue',
          exchange: 'wallet_events',
          routingKey: 'wallet.#', // wallet.created, wallet.deposit,
          options: {
            durable: true,
          },
        },
      ],
    }),
  ],
  exports: [RabbitMQUpModule],
})
export class RabbitMQModule {}
