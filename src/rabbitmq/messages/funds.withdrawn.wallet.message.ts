import { Transaction } from '../../modules/transaction/types';

export type FundsWithdrawnWalletMessage = {
  walletId: string;
  amount: number;
  transaction: Transaction;
};
