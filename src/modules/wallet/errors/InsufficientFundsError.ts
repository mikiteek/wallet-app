export class InsufficientFundsError extends Error {
  constructor(message: string = 'Insufficient funds in wallet') {
    super(message);
  }
}
