export class WithdrawWalletCommand {
  constructor(
    readonly walletId: string,
    readonly amount: number,
    readonly transactionId: string,
  ) {}
}
