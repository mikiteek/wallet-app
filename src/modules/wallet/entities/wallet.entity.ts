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
    default: Date.now(),
  })
  updatedAt: Date;
}
