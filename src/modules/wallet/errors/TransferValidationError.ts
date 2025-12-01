export class TransferValidationError extends Error {
  constructor(message: string = 'Transfer validation failed') {
    super(message);
  }
}
