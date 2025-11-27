import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchemaExtensions1764171527626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE schema IF NOT EXISTS wallets;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP extension IF EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      DROP SCHEMA IF EXISTS wallets CASCADE;
    `);
  }
}
