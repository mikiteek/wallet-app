export class TransactionAlreadyExistsError extends Error {
  constructor(message: string = 'Transaction already exists') {
    super(message);
  }
}
