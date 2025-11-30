import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WalletViewDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @Expose()
  id: number;

  @ApiProperty({
    type: 'number',
    minimum: 100,
  })
  @Expose()
  balance: number;
}
