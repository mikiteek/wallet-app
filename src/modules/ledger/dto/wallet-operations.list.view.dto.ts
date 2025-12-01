import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EntryType } from '../entities';

class WalletOperation {
  @ApiProperty({
    type: 'string',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @Expose()
  walletId: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @Expose()
  transactionId: string;

  @ApiProperty({
    type: 'string',
    enum: ['debit', 'credit'],
  })
  @Expose()
  entryType: EntryType;

  @ApiProperty({
    type: 'integer',
    description: 'Amount in cents',
  })
  @Expose()
  amount: number;

  @ApiProperty({
    type: 'integer',
    description: 'Amount in cents',
  })
  @Expose()
  balanceBefore: number;

  @ApiProperty({
    type: 'integer',
    description: 'Amount in cents',
  })
  @Expose()
  balanceAfter: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  createdAt: string;
}

export class WalletOperationsListViewDto {
  @ApiProperty({
    type: 'array',
    items: {
      $ref: '#/components/schemas/WalletOperation',
    },
  })
  @Expose()
  @Type(() => WalletOperation)
  items: WalletOperation[];
}
