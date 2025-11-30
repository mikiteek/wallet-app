import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { TransactionEntity, TransactionState } from '../entities';
import { TransactionAlreadyExistsError } from '../errors';
import { PostgresErrCodes } from '../../../common/constants';
import type { Transaction } from '../types';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityPool: EntityManager,

    private readonly logger: PinoLogger,
  ) {}

  async create(transaction: Transaction): Promise<boolean> {
    const transactionEntity = this.entityPool.create<
      TransactionEntity,
      Transaction
    >(TransactionEntity, transaction);

    try {
      await this.entityPool.insert(TransactionEntity, transactionEntity);

      return true;
    } catch (error) {
      if (error?.code === PostgresErrCodes.UNIQUE_VIOLATION) {
        this.logger.info(
          `Transaction already exists transactionId=${transaction.id}`,
        );

        const existingTransaction = await this.entityPool.findOneByOrFail(
          TransactionEntity,
          {
            id: transaction.id,
          },
        );

        throw new TransactionAlreadyExistsError(
          `Transaction already exists transactionId=${transaction.id}, state=${existingTransaction.state}`,
        );
      }

      throw error;
    }
  }

  async updateToFailed(
    transactionId: string,
    errorMessage: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager ?? this.entityPool;
    try {
      await manager.update(
        TransactionEntity,
        { id: transactionId },
        {
          state: TransactionState.FAILED,
          transactedAt: new Date(),
          errorMessage,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error updating transaction to failed transactionId=${transactionId}`,
        error,
      );

      throw error;
    }

    return true;
  }

  async updateToCommitted(
    transactionId: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const manager = entityManager ?? this.entityPool;
    await manager.update(
      TransactionEntity,
      { id: transactionId },
      {
        state: TransactionState.COMMITTED,
      },
    );

    return true;
  }
}
