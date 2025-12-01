import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WalletViewDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: 'number',
    minimum: 0,
  })
  @Expose()
  balance: number;
}
