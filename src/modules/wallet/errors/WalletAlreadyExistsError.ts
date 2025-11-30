export class WalletAlreadyExistsError extends Error {
  constructor(message: string = 'Wallet already exists') {
    super(message);
  }
}
