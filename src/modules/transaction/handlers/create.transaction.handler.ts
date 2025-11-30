import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../commands';
import { TransactionRepository } from '../repositories';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(command: CreateTransactionCommand): Promise<void> {
    await this.transactionRepository.create(command.transaction);
  }
}
