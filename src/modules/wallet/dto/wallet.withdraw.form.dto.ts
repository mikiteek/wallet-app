import { IsInt, IsPositive, Max, Min, IsUUID } from 'class-validator';

export class WalletWithdrawFormDto {
  @IsUUID()
  transactionId: string;

  @IsInt()
  @IsPositive()
  @Min(100)
  @Max(100_000_00)
  amount: number;
}
