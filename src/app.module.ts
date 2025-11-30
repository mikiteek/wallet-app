import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { DatabaseModule } from './database/typeorm.module';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
