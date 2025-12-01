import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferWalletCommand } from '../commands';
import { WalletRepository } from '../repositories';

@CommandHandler(TransferWalletCommand)
export class TransferWalletHandler
  implements ICommandHandler<TransferWalletCommand>
{
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(command: TransferWalletCommand): Promise<void> {
    const { sourceWalletId, destinationWalletId, amount, transactionId } =
      command;
    await this.walletRepository.transfer(
      sourceWalletId,
      destinationWalletId,
      amount,
      transactionId,
    );
  }
}
