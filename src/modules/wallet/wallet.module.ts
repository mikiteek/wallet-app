import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '../../config/config.module';
import { WalletEntity } from './entities';
import { WalletRepository } from './repositories';
import { WalletService } from './services';
import {
  CreateWalletHandler,
  DepositWalletHandler,
  FetchWalletHandler,
} from './handlers';
import { WalletController } from './controllers';
import { WalletOperationEntity } from '../ledger/entities';
import { TransactionRepository } from '../transaction/repositories';
import { TransactionEntity } from '../transaction/entities';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletOperationEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [WalletController],
  providers: [
    TransactionRepository,
    WalletRepository,
    WalletService,
    CreateWalletHandler,
    DepositWalletHandler,
    FetchWalletHandler,
  ],
  exports: [],
})
export class WalletModule {}
