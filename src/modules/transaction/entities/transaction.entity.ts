import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum TransactionState {
  PENDING = 'pending',
  COMMITTED = 'committed',
  FAILED = 'failed',
}

@Entity('transactions', { schema: 'wallets' })
export class TransactionEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @Column({
    type: 'bigint',
    nullable: false,
    transformer: {
      to: (value: number): string => value.toString(),
      from: (value: string): number => parseInt(value, 10),
    },
  })
  amount: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  type: TransactionType;

  @Column({
    type: 'text',
    nullable: false,
  })
  source: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  destination: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  state: TransactionState;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'transacted_at',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  transactedAt: Date | null;

  @Column({
    name: 'error_message',
    type: 'text',
    nullable: true,
  })
  errorMessage: string | null;

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
