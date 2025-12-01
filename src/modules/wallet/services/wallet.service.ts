import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PinoLogger } from 'nestjs-pino';
import {
  WalletDepositFormDto,
  WalletWithdrawFormDto,
  WalletTransferFormDto,
} from '../dto';
import { FetchWalletQuery } from '../queries';
import {
  DepositWalletCommand,
  CreateWalletCommand,
  WithdrawWalletCommand,
  TransferWalletCommand,
} from '../commands';
import { WalletEntity } from '../entities';
import { WalletPublisher } from '../publishers/wallet.publisher';
import { CreateTransactionCommand } from '../../transaction/commands';
import { TransactionState, TransactionType } from '../../transaction/entities';
import type { Transaction } from '../../transaction/types';
import { WalletNotFoundError, TransferValidationError } from '../errors';

@Injectable()
export class WalletService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly events: WalletPublisher,
    private readonly logger: PinoLogger,
  ) {}

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

  async depositFunds(
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
    await this.events.publishFundsDepositedMessage({
      walletId,
      amount,
      transactionId,
    });

    return await this.fetchWallet(walletId);
  }

  async withdrawFunds(
    walletId: string,
    dto: WalletWithdrawFormDto,
  ): Promise<WalletEntity> {
    const { amount, transactionId } = dto;

    const transaction: Transaction = {
      id: transactionId,
      amount,
      type: TransactionType.WITHDRAW,
      source: walletId,
      destination: 'external',
      state: TransactionState.PENDING,
      description: 'Withdrawal from wallet',
      transactedAt: null,
      errorMessage: null,
    };
    const createTransactionCommand = new CreateTransactionCommand(transaction);
    await this.commandBus.execute<CreateTransactionCommand>(
      createTransactionCommand,
    );

    const withdrawCommand = new WithdrawWalletCommand(
      walletId,
      amount,
      transactionId,
    );
    await this.commandBus.execute<WithdrawWalletCommand>(withdrawCommand);
    await this.events.publishFundsWithdrawnMessage({
      walletId,
      amount,
      transactionId,
    });

    return await this.fetchWallet(walletId);
  }

  async transfer(
    sourceWalletId: string,
    dto: WalletTransferFormDto,
  ): Promise<WalletEntity> {
    const { toWalletId, amount, transactionId } = dto;
    if (sourceWalletId === toWalletId) {
      const errorMessage = `Source and destination wallet IDs are the same: ${sourceWalletId}`;
      this.logger.warn(errorMessage);
      throw new TransferValidationError(errorMessage);
    }

    const transaction: Transaction = {
      id: transactionId,
      amount,
      type: TransactionType.TRANSFER,
      source: sourceWalletId,
      destination: toWalletId,
      state: TransactionState.PENDING,
      description: 'Transfer between wallets',
      transactedAt: null,
      errorMessage: null,
    };
    const createTransactionCommand = new CreateTransactionCommand(transaction);
    try {
      await this.commandBus.execute<CreateTransactionCommand>(
        createTransactionCommand,
      );
      await this.events.publishTransferInitiatedMessage({
        fromWalletId: sourceWalletId,
        toWalletId,
        amount,
        transactionId,
      });

      const transferCommand = new TransferWalletCommand(
        sourceWalletId,
        toWalletId,
        amount,
        transactionId,
      );
      await this.commandBus.execute<TransferWalletCommand>(transferCommand);
      await this.events.publishFundsTransferredMessage({
        fromWalletId: sourceWalletId,
        toWalletId,
        amount,
        transactionId,
      });

      return await this.fetchWallet(sourceWalletId);
    } catch (error) {
      const errorMessage: string =
        (error?.message as string) ||
        `Transfer from wallet=${sourceWalletId} to wallet=${toWalletId} failed. Reason is unknown`;
      await this.events.publishTransferFailedMessage({
        fromWalletId: sourceWalletId,
        toWalletId,
        amount,
        transactionId,
        reason: errorMessage,
      });

      throw error;
    }
  }
}
