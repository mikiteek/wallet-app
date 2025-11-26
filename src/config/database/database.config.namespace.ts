import { registerAs } from '@nestjs/config';
import type { DatabaseConfig } from './databse.config';

export default registerAs('database', (): DatabaseConfig => {
  const { DB_PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_SCHEMA } =
    process.env;
  if (!DB_PORT) {
    throw new Error('DB_PORT environment variable is not set');
  }

  if (!DB_HOST) {
    throw new Error('DB_HOST environment variable is not set');
  }

  if (!DB_USER) {
    throw new Error('DB_USER environment variable is not set');
  }

  if (!DB_PASSWORD) {
    throw new Error('DB_PASSWORD environment variable is not set');
  }

  if (!DB_NAME) {
    throw new Error('DB_NAME environment variable is not set');
  }

  if (!DB_SCHEMA) {
    throw new Error('DB_SCHEMA environment variable is not set');
  }

  return {
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    schema: DB_SCHEMA,
    synchronize: false,
    dropSchema: false,
  };
});
