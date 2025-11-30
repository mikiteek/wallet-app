import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WalletDepositFormDto } from '../dto';
import { FetchWalletQuery } from '../queries';
import { DepositWalletCommand, CreateWalletCommand } from '../commands';
import { WalletEntity } from '../entities';
import { WalletPublisher } from '../publishers/wallet.publisher';
import { CreateTransactionCommand } from '../../transaction/commands';
import { TransactionState, TransactionType } from '../../transaction/entities';
import type { Transaction } from '../../transaction/types';

@Injectable()
export class WalletService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly events: WalletPublisher,
  ) {}

  async depositWallet(
    walletId: string,
    dto: WalletDepositFormDto,
  ): Promise<WalletEntity> {
    const fetchWalletQuery = new FetchWalletQuery(walletId);
    const wallet = await this.queryBus.execute<FetchWalletQuery, WalletEntity>(
      fetchWalletQuery,
    );
    if (!wallet) {
      const createWalletCommand = new CreateWalletCommand(walletId);
      await this.commandBus.execute<CreateWalletCommand, void>(
        createWalletCommand,
      );
      await this.events.publishWalletCreatedMessage({ walletId });
    }
    const transaction: Transaction = {
      id: dto.transactionId,
      amount: dto.amount,
      type: TransactionType.DEPOSIT,
      source: 'external',
      destination: walletId,
      state: TransactionState.PENDING,
      description: 'Deposit to wallet',
      transactedAt: null,
      errorMessage: null,
    };
    const createTransactionCommand = new CreateTransactionCommand(transaction);
    await this.commandBus.execute<CreateTransactionCommand>(
      createTransactionCommand,
    );

    const depositCommand = new DepositWalletCommand(
      walletId,
      dto.amount,
      dto.transactionId,
    );
    await this.commandBus.execute<DepositWalletCommand>(depositCommand);

    return await this.queryBus.execute<FetchWalletQuery, WalletEntity>(
      fetchWalletQuery,
    );
  }
}
