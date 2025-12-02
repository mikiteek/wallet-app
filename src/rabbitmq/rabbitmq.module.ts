import { Module } from '@nestjs/common';
import { RabbitMQModule as RabbitMQUpModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RabbitMQConfig } from '../config/rabbitmq/rabbitmq.config';

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
        };
      },
    }),
  ],
  exports: [RabbitMQUpModule],
})
export class RabbitMQModule {}
