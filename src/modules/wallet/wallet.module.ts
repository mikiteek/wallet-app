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
  WithdrawWalletHandler,
  TransferWalletHandler,
} from './handlers';
import { WalletPublisher } from './publishers/wallet.publisher';
import { WalletController } from './controllers';
import { WalletOperationEntity } from '../ledger/entities';
import { TransactionModule } from '../transaction/transaction.module';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    RabbitMQModule,
    TypeOrmModule.forFeature([WalletEntity, WalletOperationEntity]),
    TransactionModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletRepository,
    WalletService,
    CreateWalletHandler,
    DepositWalletHandler,
    FetchWalletHandler,
    WithdrawWalletHandler,
    TransferWalletHandler,
    WalletPublisher,
  ],
  exports: [],
})
export class WalletModule {}
