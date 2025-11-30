import { TransactionEntity } from '../entities';

export type Transaction = Pick<
  TransactionEntity,
  | 'id'
  | 'amount'
  | 'type'
  | 'source'
  | 'destination'
  | 'state'
  | 'description'
  | 'transactedAt'
  | 'errorMessage'
>;
