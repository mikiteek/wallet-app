import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionRepository } from './repositories';
import { TransactionEntity } from './entities';
import { CreateTransactionHandler } from './handlers';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), CqrsModule],
  providers: [TransactionRepository, CreateTransactionHandler],
  exports: [TransactionRepository, CreateTransactionHandler],
})
export class TransactionModule {}
