import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1764180761725 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets.wallets
      (
          id uuid PRIMARY KEY,
          balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
          created_at timestamptz default now(),
          updated_at timestamptz
      );
      
      COMMENT ON TABLE wallets.wallets IS 'Wallets table.';
      COMMENT ON COLUMN wallets.wallets.id IS 'Internal identifier for binding to other tables.';
      COMMENT ON COLUMN wallets.wallets.balance IS 'Wallet balance. Positive values only.';
      COMMENT ON COLUMN wallets.wallets.created_at IS 'Timestamp when the row was created.';
      COMMENT ON COLUMN wallets.wallets.updated_at IS 'Timestamp when the row was updated.';
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets.transactions
      (
          id uuid PRIMARY KEY,
          amount bigint NOT NULL CHECK (amount >= 0),
          type text CHECK (type IN ('deposit', 'withdraw', 'transfer')),
          source text NOT NULL,
          destination text NOT NULL,
          state text CHECK (state IN ('pending', 'committed', 'failed')),
          description text,
          transacted_at timestamptz,
          error_message text,
          created_at timestamptz default now(),
          updated_at timestamptz default now()
      );

      COMMENT ON TABLE wallets.transactions IS 'Transactions table. Tracks basic available operations with wallets.';
      COMMENT ON COLUMN wallets.transactions.id IS 'Internal identifier for binding to other tables.';
      COMMENT ON COLUMN wallets.transactions.amount IS 'Transaction amount. Positive values only.';
      COMMENT ON COLUMN wallets.transactions.type IS 'Type of transaction.';
      COMMENT ON COLUMN wallets.transactions.source IS 'Transaction source, wallet_id of sender for transfers, withdrawals and "external" for deposits.';
      COMMENT ON COLUMN wallets.transactions.destination IS 'Transaction destination. wallet_id of receiver for transfers, deposits and "external" for withdrawals.';
      COMMENT ON COLUMN wallets.transactions.state IS 'Transaction state.';
      COMMENT ON COLUMN wallets.transactions.description IS 'Transaction description.';
      COMMENT ON COLUMN wallets.transactions.transacted_at IS 'Timestamp when the transaction was finalized (committed, cancelled etc).';
      COMMENT ON COLUMN wallets.transactions.error_message IS 'Error message for failed transaction.';
      COMMENT ON COLUMN wallets.transactions.created_at IS 'Timestamp when the row was created.';
      COMMENT ON COLUMN wallets.transactions.updated_at IS 'Timestamp when the row was updated.';
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets.wallet_operations
      (
          id bigserial PRIMARY KEY,
          wallet_id uuid NOT NULL REFERENCES wallets.wallets(id),
          transaction_id uuid NOT NULL REFERENCES wallets.transactions(id),
          entry_type text NOT NULL CHECK (entry_type IN ('debit','credit')),
          amount bigint NOT NULL,
          balance_before bigint NOT NULL,
          balance_after bigint NOT NULL,
          created_at timestamptz default now()
      );
      
      COMMENT ON TABLE wallets.wallet_operations IS 'Contains commited successful wallet operations linked to transactions';
      COMMENT ON COLUMN wallets.wallet_operations.id IS 'Internal identifier for binding to other tables.';
      COMMENT ON COLUMN wallets.wallet_operations.wallet_id IS 'Wallet identifier, foreign key.';
      COMMENT ON COLUMN wallets.wallet_operations.transaction_id IS 'Transaction identifier, foreign key.';
      COMMENT ON COLUMN wallets.wallet_operations.entry_type IS 'Wallet entry type.';
      COMMENT ON COLUMN wallets.wallet_operations.amount IS 'Wallet operation amount.';
      COMMENT ON COLUMN wallets.wallet_operations.balance_before IS 'Balance before operation.';
      COMMENT ON COLUMN wallets.wallet_operations.balance_after IS 'Balance after operation.';
      COMMENT ON COLUMN wallets.wallet_operations.created_at IS 'Timestamp when the row was created.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS wallets.wallet_operations;
      DROP TABLE IF EXISTS wallets.transactions;
      DROP TABLE IF EXISTS wallets.wallets;
    `);
  }
}
