import { FundsTransferInitiatedWalletMessage } from './funds.transfer-initiated.wallet.message';

export type FundsTransferFailedWalletMessage =
  FundsTransferInitiatedWalletMessage & {
    reason: string;
  };
