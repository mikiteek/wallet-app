import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawWalletCommand } from '../commands';
import { WalletRepository } from '../repositories';

@CommandHandler(WithdrawWalletCommand)
export class WithdrawWalletHandler
  implements ICommandHandler<WithdrawWalletCommand>
{
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(command: WithdrawWalletCommand): Promise<void> {
    const { walletId, amount, transactionId } = command;
    await this.walletRepository.withdraw(walletId, amount, transactionId);
  }
}
