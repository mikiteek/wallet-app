import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { WalletOperationEntity } from '../entities';

@Injectable()
export class WalletOperationRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityPool: EntityManager,
  ) {}

  async fetchOperationsList(
    walletId: string,
  ): Promise<WalletOperationEntity[]> {
    return this.entityPool.find(WalletOperationEntity, {
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }
}
