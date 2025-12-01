import { registerAs } from '@nestjs/config';
import type { RabbitMQConfig } from './rabbitmq.config';

export default registerAs('rabbitmq', (): RabbitMQConfig => {
  const { RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD } =
    process.env;

  if (!RABBITMQ_HOST) {
    throw new Error('RABBITMQ_HOST environment variable is not set');
  }

  if (!RABBITMQ_PORT) {
    throw new Error('RABBITMQ_PORT environment variable is not set');
  }

  if (!RABBITMQ_USER) {
    throw new Error('RABBITMQ_USER environment variable is not set');
  }

  if (!RABBITMQ_PASSWORD) {
    throw new Error('RABBITMQ_PASSWORD environment variable is not set');
  }

  return {
    host: RABBITMQ_HOST,
    port: Number(RABBITMQ_PORT),
    user: RABBITMQ_USER,
    password: RABBITMQ_PASSWORD,
  };
});
