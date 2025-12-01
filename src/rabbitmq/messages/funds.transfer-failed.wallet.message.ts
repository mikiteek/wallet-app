import { FundTransferInitiatedWalletMessage } from './funds.transfer-initiated.wallet.message';

export type FundsTransferFailedWalletMessage =
  FundTransferInitiatedWalletMessage & {
    reason: string;
  };
