export class WalletNotFoundError extends Error {
  constructor(message: string = 'Wallet not found') {
    super(message);
  }
}
