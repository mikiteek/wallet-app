import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationsTable1764671967719 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets.notifications
      (
          id uuid PRIMARY KEY,
          type text NOT NULL CHECK (type IN ('email')),
          title text NOT NULL,
          message text,
          email_address text,
          created_at timestamptz default now(),
          updated_at timestamptz
      );

      COMMENT ON TABLE wallets.notifications IS 'Notifications table.';
      COMMENT ON COLUMN wallets.notifications.id IS 'Internal identifier for binding to other tables.';
      COMMENT ON COLUMN wallets.notifications.type IS 'Type of notification.';
      COMMENT ON COLUMN wallets.notifications.title IS 'Title of the notification.';
      COMMENT ON COLUMN wallets.notifications.message IS 'Message content of the notification.';
      COMMENT ON COLUMN wallets.notifications.email_address IS 'Email address to which the notification is sent.';
      COMMENT ON COLUMN wallets.notifications.created_at IS 'Timestamp when the row was created.';
      COMMENT ON COLUMN wallets.notifications.updated_at IS 'Timestamp when the row was updated.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS wallets.notifications;
    `);
  }
}
