import { IsInt, Max, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletDepositFormDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Unique transaction identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  transactionId: string;

  @ApiProperty({
    type: 'integer',
    description: 'Amount to deposit in cents',
    example: 5000,
    minimum: 100,
    maximum: 10000000,
  })
  @IsInt()
  @Min(100)
  @Max(100_000_00)
  amount: number;
}
