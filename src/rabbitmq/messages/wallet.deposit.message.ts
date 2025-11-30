import { Transaction } from '../../modules/transaction/types';

export type WalletDepositMessage = {
  walletId: string;
  amount: number;
  transaction: Transaction;
};
