import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { DatabaseConfig } from '../config/database/databse.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        if (!dbConfig) {
          throw new Error('Missing database config');
        }

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          schema: dbConfig.schema,
          entities: [resolve(__dirname, '../', '**/**/*.entity{.ts,.js}')],
          migrations: [resolve(__dirname, './migrations/*{.ts,.js}')],
          synchronize: dbConfig.synchronize,
          dropSchema: dbConfig.dropSchema,
          logger: 'advanced-console',
          logging: 'all',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
