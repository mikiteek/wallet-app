import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WalletDepositFormDto } from '../dto';
import { FetchWalletQuery } from '../queries';
import { DepositWalletCommand } from '../commands';
import { CreateWalletCommand } from '../commands';
import { WalletEntity } from '../entities';
import { TransactionState, TransactionType } from '../../transaction/entities';
import type { Transaction } from '../../transaction/types';

@Injectable()
export class WalletService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    const depositCommand = new DepositWalletCommand(walletId, transaction);
    await this.commandBus.execute<DepositWalletCommand>(depositCommand);

    return await this.queryBus.execute<FetchWalletQuery, WalletEntity>(
      fetchWalletQuery,
    );
  }
}
