export class TransferWalletCommand {
  constructor(
    readonly sourceWalletId: string,
    readonly destinationWalletId: string,
    readonly amount: number,
    readonly transactionId: string,
  ) {}
}
