import { Transaction } from '../../transaction/types';

export class DepositWalletCommand {
  constructor(
    readonly walletId: string,
    readonly transaction: Transaction,
  ) {}
}
