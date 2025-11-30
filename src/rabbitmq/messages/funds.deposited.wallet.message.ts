import { Transaction } from '../../modules/transaction/types';

export type FundsDepositedWalletMessage = {
  walletId: string;
  amount: number;
  transaction: Transaction;
};
