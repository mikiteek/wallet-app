import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { WalletRepository } from '../repositories';
import { FetchWalletQuery } from '../queries';
import { WalletEntity } from '../entities';

@QueryHandler(FetchWalletQuery)
export class FetchWalletHandler implements IQueryHandler<FetchWalletQuery> {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(query: FetchWalletQuery): Promise<WalletEntity | null> {
    return this.walletRepository.fetchById(query.walletId);
  }
}
