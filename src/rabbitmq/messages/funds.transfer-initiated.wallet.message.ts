export type FundTransferInitiatedWalletMessage = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  transactionId: string;
};
