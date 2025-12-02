import { Module } from '@nestjs/common';
import { RabbitMQModule as RabbitMQUpModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RabbitMQConfig } from '../../config/rabbitmq/rabbitmq.config';

@Module({
  imports: [
    RabbitMQUpModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rabbitMQConfig = configService.get<RabbitMQConfig>('rabbitmq');
        if (!rabbitMQConfig) {
          throw new Error('Missing RabbitMQ config');
        }
        const { host, port, user, password } = rabbitMQConfig;

        return {
          uri: `amqp://${user}:${password}@${host}:${port}`, // amqp://guest:guest@localhost:5672
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
                deadLetterExchange: 'wallet_events_dead_letter',
                deadLetterRoutingKey: 'wallet.dead_letter',
              },
            },
            {
              name: 'wallet-events-dead-letter-queue',
              exchange: 'wallet_events_dead_letter',
              routingKey: 'wallet.dead_letter',
              options: {
                durable: true,
              },
            },
          ],
        };
      },
    }),
  ],
  exports: [RabbitMQUpModule],
})
export class NotificationRabbitModule {}
