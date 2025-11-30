import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DepositWalletCommand } from '../commands';
import { WalletRepository } from '../repositories';

@CommandHandler(DepositWalletCommand)
export class DepositWalletHandler
  implements ICommandHandler<DepositWalletCommand>
{
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(command: DepositWalletCommand): Promise<void> {
    const { walletId, amount, transactionId } = command;
    await this.walletRepository.deposit(walletId, amount, transactionId);
  }
}
