import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WalletWithdrawFormDto } from '../src/modules/wallet/dto/wallet.withdraw.form.dto';

describe('Wallet Withdraw (e2e)', () => {
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
      [testWalletId, '20000'],
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /wallet/:id/withdraw', () => {
    it('should successfully withdraw funds from a wallet', async () => {
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      const response = await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testWalletId,
        balance: 15000,
      });

      const transaction = await dataSource.query(
        'SELECT * FROM wallets.transactions WHERE id = $1',
        [withdrawDto.transactionId],
      );
      expect(transaction).toHaveLength(1);
      expect(transaction[0].amount).toBe('5000');
    });

    it('should handle multiple withdrawals from the same wallet', async () => {
      const firstWithdraw: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 3000,
      };

      const secondWithdraw: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 2000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(firstWithdraw)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(secondWithdraw)
        .expect(200);

      expect(response.body.balance).toBe(15000);
    });

    it('should return 409 when insufficient funds', async () => {
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 25000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(409);
    });

    it('should return 409 when transaction ID already exists', async () => {
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(409);
    });

    it('should return 404 when wallet does not exist', async () => {
      const nonExistentWalletId = randomUUID();
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${nonExistentWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(404);
    });

    it('should return 400 when amount is negative', async () => {
      const withdrawDto = {
        transactionId: randomUUID(),
        amount: -5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(400);
    });

    it('should return 400 when amount is zero', async () => {
      const withdrawDto = {
        transactionId: randomUUID(),
        amount: 0,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(400);
    });

    it('should return 400 when transactionId is missing', async () => {
      const withdrawDto: Partial<WalletWithdrawFormDto> = {
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(400);
    });

    it('should return 400 when amount is missing', async () => {
      const withdrawDto: Partial<WalletWithdrawFormDto> = {
        transactionId: randomUUID(),
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/withdraw`)
        .send(withdrawDto)
        .expect(400);
    });

    it('should return 400 when wallet ID is not a valid UUID', async () => {
      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post('/wallet/invalid-uuid/withdraw')
        .send(withdrawDto)
        .expect(400);
    });
  });
});
