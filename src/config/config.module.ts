import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import serverConfig from './server/server.config.namespace';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [serverConfig],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
