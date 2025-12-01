import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets', { schema: 'wallets' })
export class WalletEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @Column({
    nullable: false,
    type: 'bigint',
    transformer: {
      to: (value: number): string => value.toString(),
      from: (value: string): number => parseInt(value, 10),
    },
  })
  balance: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt: Date;
}
