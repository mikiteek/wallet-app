export class DepositWalletCommand {
  constructor(
    readonly walletId: string,
    readonly amount: number,
    readonly transactionId: string,
  ) {}
}
