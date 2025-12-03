import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WalletDepositFormDto } from '../src/modules/wallet/dto/wallet.deposit.form.dto';
import { WalletWithdrawFormDto } from '../src/modules/wallet/dto/wallet.withdraw.form.dto';

describe('Wallet History (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testWalletId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE wallets.notifications CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallet_operations CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.transactions CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallets CASCADE');

    testWalletId = randomUUID();
    await dataSource.query(
      `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
      [testWalletId, '50000'],
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /wallet/:id/history', () => {
    it('should return empty history for wallet with no operations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/wallet/${testWalletId}/history`)
        .expect(200);

      expect(response.body.items).toEqual([]);
    });

    it('should return history with deposit operation', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/wallet/${testWalletId}/history`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          transactionId: depositDto.transactionId,
          entryType: 'credit',
          amount: 10000,
          balanceBefore: 50000,
          balanceAfter: 60000,
        }),
      );
      expect(response.body.items[0].createdAt).toBeDefined();
    });

    it('should return history with withdraw operation', async () => {
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/wallet/${testWalletId}/history`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          transactionId: withdrawDto.transactionId,
          entryType: 'debit',
          amount: -5000,
          balanceBefore: 50000,
          balanceAfter: 45000,
        }),
      );
      expect(response.body.items[0].createdAt).toBeDefined();
    });

    it('should return history with multiple operations in order', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
      };

      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 3000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/wallet/${testWalletId}/history`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      
      expect(response.body.items[1]).toEqual(
        expect.objectContaining({
          transactionId: depositDto.transactionId,
          entryType: 'credit',
          amount: 10000,
        }),
      );
      
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          transactionId: withdrawDto.transactionId,
          entryType: 'debit',
          amount: -3000,
        }),
      );
    });

    it('should return 404 when wallet does not exist', async () => {
      const nonExistentWalletId = randomUUID();

      await request(app.getHttpServer())
        .get(`/wallet/${nonExistentWalletId}/history`)
        .expect(404);
    });

    it('should return 400 when wallet ID is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/wallet/invalid-uuid/history')
        .expect(400);
    });
  });
});
