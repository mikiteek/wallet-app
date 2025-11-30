import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWalletCommand } from '../commands';
import { WalletRepository } from '../repositories';

@CommandHandler(CreateWalletCommand)
export class CreateWalletHandler
  implements ICommandHandler<CreateWalletCommand>
{
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(command: CreateWalletCommand): Promise<void> {
    await this.walletRepository.create(command.walletId);
  }
}
