import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { WalletOperationRepository } from '../repositories';
import { FetchWalletOperationsQuery } from '../queries';
import { WalletOperationEntity } from '../entities';

@QueryHandler(FetchWalletOperationsQuery)
export class FetchWalletOperationsHandler
  implements IQueryHandler<FetchWalletOperationsQuery>
{
  constructor(
    private readonly walletOperationRepository: WalletOperationRepository,
  ) {}

  async execute(
    query: FetchWalletOperationsQuery,
  ): Promise<WalletOperationEntity[]> {
    return this.walletOperationRepository.fetchOperationsList(query.walletId);
  }
}
