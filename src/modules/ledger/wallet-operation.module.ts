import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WalletOperationRepository } from './repositories';
import { WalletOperationEntity } from './entities';
import { FetchWalletOperationsHandler } from './handlers';

@Module({
  imports: [TypeOrmModule.forFeature([WalletOperationEntity]), CqrsModule],
  providers: [WalletOperationRepository, FetchWalletOperationsHandler],
  exports: [WalletOperationRepository, FetchWalletOperationsHandler],
})
export class WalletOperationModule {}
