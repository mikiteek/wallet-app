import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PinoLogger } from 'nestjs-pino';
import { WalletDepositFormDto } from '../dto';
import { FetchWalletQuery } from '../queries';
import { DepositWalletCommand, CreateWalletCommand } from '../commands';
import { WalletEntity } from '../entities';
import { WalletPublisher } from '../publishers/wallet.publisher';
import { CreateTransactionCommand } from '../../transaction/commands';
import { TransactionState, TransactionType } from '../../transaction/entities';
import type { Transaction } from '../../transaction/types';
import { WalletNotFoundError } from '../errors';

@Injectable()
export class WalletService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly events: WalletPublisher,
    private readonly logger: PinoLogger,
  ) {}

  async depositWallet(
    walletId: string,
    dto: WalletDepositFormDto,
  ): Promise<WalletEntity> {
    const { amount, transactionId } = dto;
    const fetchWalletQuery = new FetchWalletQuery(walletId);
    const wallet = await this.queryBus.execute<FetchWalletQuery, WalletEntity>(
      fetchWalletQuery,
    );
    if (!wallet) {
      this.logger.debug(
        `Wallet with ID ${walletId} not found. Creating new wallet.`,
      );
      const createWalletCommand = new CreateWalletCommand(walletId);
      await this.commandBus.execute<CreateWalletCommand, void>(
        createWalletCommand,
      );
      await this.events.publishWalletCreatedMessage({ walletId });
    }
    const transaction: Transaction = {
      id: transactionId,
      amount,
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
      amount,
      transactionId,
    );
    await this.commandBus.execute<DepositWalletCommand>(depositCommand);
    await this.events.publishWalledDepositMessage({
      walletId,
      amount,
      transaction,
    });

    return await this.queryBus.execute<FetchWalletQuery, WalletEntity>(
      fetchWalletQuery,
    );
  }

  async fetchWallet(walletId: string): Promise<WalletEntity> {
    const fetchWalletQuery = new FetchWalletQuery(walletId);
    const wallet = await this.queryBus.execute<
      FetchWalletQuery,
      WalletEntity | null
    >(fetchWalletQuery);

    if (!wallet) {
      const errorMessage = `Wallet with ID ${walletId} not found`;
      this.logger.error(errorMessage);
      throw new WalletNotFoundError(errorMessage);
    }

    return wallet;
  }
}
