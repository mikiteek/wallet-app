export type FundsTransferInitiatedWalletMessage = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  transactionId: string;
};
