import { IsInt, Max, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletTransferFormDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Unique transaction identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  transactionId: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Destination wallet identifier',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  toWalletId: string;

  @ApiProperty({
    type: 'number',
    description: 'Amount to transfer in cents',
    minimum: 100,
    maximum: 10000000,
  })
  @IsInt()
  @Min(100)
  @Max(100_000_000)
  amount: number;
}
