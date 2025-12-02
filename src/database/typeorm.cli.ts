import { DataSource } from 'typeorm';
import { resolve } from 'path';
console.log('Loading TypeORM configuration from typeorm.cli.ts');
console.log('process.env.DB_NAME - ', process.env.DB_NAME);
console.log('process.env - ', process.env);

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'wallets_pg',
  entities: [resolve(__dirname, '../', '**/**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, '../', 'database/migrations/*{.ts,.js}')],
  synchronize: false,
  dropSchema: false,
  logger: 'advanced-console',
  logging: ['warn', 'error', 'info'],
});

export default dataSource;
