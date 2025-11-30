import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { WalletEntity } from '../entities';
import { WalletAlreadyExistsError, WalletNotFoundError } from '../errors';
import { WalletOperationEntity, EntryType } from '../../ledger/entities';
import { TransactionRepository } from '../../transaction/repositories';
import { PostgresErrCodes } from '../../../common/constants';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,

    private readonly logger: PinoLogger,

    private readonly transactionRepository: TransactionRepository,
  ) {}

  async fetchById(walletId: string): Promise<WalletEntity | null> {
    return this.entityManager.findOneBy(WalletEntity, { id: walletId });
  }

  async create(walletId: string): Promise<boolean> {
    let wallet: WalletEntity | null = null;
    try {
      wallet = this.entityManager.create(WalletEntity, {
        id: walletId,
        balance: 0,
      });

      await this.entityManager.insert(WalletEntity, wallet);

      return true;
    } catch (error) {
      if (error?.code === PostgresErrCodes.UNIQUE_VIOLATION) {
        const errorMessage = `Wallet already exists walletId=${walletId}`;
        this.logger.warn(errorMessage);

        throw new WalletAlreadyExistsError(errorMessage);
      }

      this.logger.error(`Error on creating walletId=${walletId}`);
      throw error;
    }
  }

  async deposit(
    walletId: string,
    amount: number,
    transactionId: string,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    const entityManager = queryRunner.manager;
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      // At this moment the wallet has to be created
      const wallet = await entityManager.findOne(WalletEntity, {
        where: { id: walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new WalletNotFoundError(
          `Error on fetching wallet for deposit walletId=${walletId}`,
        );
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;
      const walletOperation = entityManager.create(WalletOperationEntity, {
        walletId,
        transactionId,
        entryType: EntryType.CREDIT,
        amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
      });
      await entityManager.save(WalletOperationEntity, walletOperation);

      wallet.balance = balanceAfter;
      await entityManager.save(WalletEntity, wallet);
      await this.transactionRepository.updateToCommitted(
        transactionId,
        entityManager,
      );

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.transactionRepository.updateToFailed(
        transactionId,
        errorMessage,
      );

      this.logger.error('Error depositing to wallet', {
        error: error as unknown,
        transactionId,
        walletId,
        amount,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
