import { Transaction } from '../types';

export class CreateTransactionCommand {
  constructor(readonly transaction: Transaction) {}
}
