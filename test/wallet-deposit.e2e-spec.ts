import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WalletDepositFormDto } from '../src/modules/wallet/dto/wallet.deposit.form.dto';

describe('Wallet Deposit (e2e)', () => {
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
    await dataSource.query('TRUNCATE TABLE wallets.wallet_operations CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.transactions CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallets CASCADE');

    testWalletId = randomUUID();
    await dataSource.query(
      `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
      [testWalletId, '0'],
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /wallet/:id/deposit', () => {
    it('should successfully deposit funds to a wallet', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10050,
      };

      const response = await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testWalletId,
        balance: 10050,
      });

      const transaction = await dataSource.query(
        'SELECT * FROM wallets.transactions WHERE id = $1',
        [depositDto.transactionId],
      );
      expect(transaction).toHaveLength(1);
      expect(transaction[0].amount).toBe('10050');
    });

    it('should handle multiple deposits to the same wallet', async () => {
      const firstDeposit: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      const secondDeposit: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 7525,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(firstDeposit)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(secondDeposit)
        .expect(200);

      expect(response.body.balance).toBe(12525);
    });

    it('should return 409 when transaction ID already exists', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(409);
    });

    it('should return 400 when amount is negative', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: -5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when amount is zero', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 0,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when transactionId is missing', async () => {
      const depositDto: Partial<WalletDepositFormDto> = {
        amount: 10000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when transactionId is not a valid UUID', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: 'invalid-uuid',
        amount: 10000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when amount is missing', async () => {
      const depositDto: Partial<WalletDepositFormDto> = {
        transactionId: randomUUID(),
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when wallet ID is not a valid UUID', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
      };

      await request(app.getHttpServer())
        .post('/wallet/invalid-uuid/deposit')
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when amount is below minimum (100 cents)', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 99,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });

    it('should return 400 when amount exceeds maximum (10000000 cents)', async () => {
      const depositDto: WalletDepositFormDto = {
        transactionId: randomUUID(),
        amount: 10000001,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${testWalletId}/deposit`)
        .send(depositDto)
        .expect(400);
    });
  });
});
