import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from '../../wallet/entities';
import { TransactionEntity } from '../../transaction/entities';

export enum EntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('wallet_operations', { schema: 'wallets' })
export class WalletOperationEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'wallet_id',
    type: 'uuid',
    nullable: false,
  })
  walletId: string;

  @ManyToOne(() => WalletEntity)
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @Column({
    name: 'transaction_id',
    type: 'uuid',
    nullable: false,
  })
  transactionId: string;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  @Column({
    name: 'entry_type',
    type: 'text',
    nullable: false,
  })
  entryType: EntryType;

  @Column({
    type: 'bigint',
    nullable: false,
  })
  amount: number;

  @Column({
    name: 'balance_before',
    type: 'bigint',
    nullable: false,
  })
  balanceBefore: number;

  @Column({
    name: 'balance_after',
    type: 'bigint',
    nullable: false,
  })
  balanceAfter: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;
}
