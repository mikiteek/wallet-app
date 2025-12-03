import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WalletTransferFormDto } from '../src/modules/wallet/dto/wallet.transfer.form.dto';
import { WalletWithdrawFormDto } from '../src/modules/wallet/dto/wallet.withdraw.form.dto';

describe('Wallet Concurrency (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    let retries = 5;
    while (retries > 0) {
      try {
        await dataSource.query('SELECT 1');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE wallets.notifications CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallet_operations CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.transactions CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallets CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Concurrent transfers between two users', () => {
    it('should handle simultaneous transfers from User A to User B and User B to User A', async () => {
      const userAWalletId = randomUUID();
      const userBWalletId = randomUUID();

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [userAWalletId, '50000'],
      );

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [userBWalletId, '30000'],
      );

      const transferAtoB: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
        toWalletId: userBWalletId,
      };

      const transferBtoA: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: userAWalletId,
      };

      const [responseAtoB, responseBtoA] = await Promise.all([
        request(app.getHttpServer())
          .post(`/wallet/${userAWalletId}/transfer`)
          .send(transferAtoB),
        request(app.getHttpServer())
          .post(`/wallet/${userBWalletId}/transfer`)
          .send(transferBtoA),
      ]);

      expect(responseAtoB.status).toBe(200);
      expect(responseBtoA.status).toBe(200);

      const walletA = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [userAWalletId],
      );
      const walletB = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [userBWalletId],
      );

      expect(walletA[0].balance).toBe('45000');
      expect(walletB[0].balance).toBe('35000');
    });

    it('should handle multiple concurrent transfers between same users', async () => {
      const userAWalletId = randomUUID();
      const userBWalletId = randomUUID();

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [userAWalletId, '100000'],
      );

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [userBWalletId, '100000'],
      );

      const transfers = [
        {
          from: userAWalletId,
          dto: {
            transactionId: randomUUID(),
            amount: 1000,
            toWalletId: userBWalletId,
          },
        },
        {
          from: userBWalletId,
          dto: {
            transactionId: randomUUID(),
            amount: 2000,
            toWalletId: userAWalletId,
          },
        },
        {
          from: userAWalletId,
          dto: {
            transactionId: randomUUID(),
            amount: 3000,
            toWalletId: userBWalletId,
          },
        },
        {
          from: userBWalletId,
          dto: {
            transactionId: randomUUID(),
            amount: 4000,
            toWalletId: userAWalletId,
          },
        },
      ];

      const responses = await Promise.all(
        transfers.map(({ from, dto }) =>
          request(app.getHttpServer())
            .post(`/wallet/${from}/transfer`)
            .send(dto),
        ),
      );

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      const walletA = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [userAWalletId],
      );
      const walletB = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [userBWalletId],
      );

      expect(walletA[0].balance).toBe('102000');
      expect(walletB[0].balance).toBe('98000');
    });
  });

  describe('Concurrent withdraw and transfer operations', () => {
    it('should allow only one operation when user attempts withdraw and transfer with exact balance', async () => {
      const walletId = randomUUID();
      const destinationWalletId = randomUUID();

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [walletId, '10000'],
      );

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [destinationWalletId, '0'],
      );

      const withdrawDto: WalletWithdrawFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
      };

      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
        toWalletId: destinationWalletId,
      };

      const [withdrawResponse, transferResponse] = await Promise.all([
        request(app.getHttpServer())
          .post(`/wallet/${walletId}/withdraw`)
          .send(withdrawDto),
        request(app.getHttpServer())
          .post(`/wallet/${walletId}/transfer`)
          .send(transferDto),
      ]);

      const successCount = [withdrawResponse, transferResponse].filter(
        (r) => r.status === 200,
      ).length;
      const failureCount = [withdrawResponse, transferResponse].filter(
        (r) => r.status === 409,
      ).length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      const wallet = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [walletId],
      );

      expect(wallet[0].balance).toBe('0');
    });

    it('should handle concurrent withdraws and transfers with partial balance', async () => {
      const walletId = randomUUID();
      const destinationWalletId = randomUUID();

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [walletId, '15000'],
      );

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [destinationWalletId, '0'],
      );

      const operations = [
        {
          endpoint: 'withdraw',
          dto: {
            transactionId: randomUUID(),
            amount: 8000,
          },
        },
        {
          endpoint: 'transfer',
          dto: {
            transactionId: randomUUID(),
            amount: 8000,
            toWalletId: destinationWalletId,
          },
        },
      ];

      const responses = await Promise.all(
        operations.map(({ endpoint, dto }) =>
          request(app.getHttpServer())
            .post(`/wallet/${walletId}/${endpoint}`)
            .send(dto),
        ),
      );

      const successCount = responses.filter((r) => r.status === 200).length;
      const failureCount = responses.filter((r) => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      const wallet = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [walletId],
      );

      expect(wallet[0].balance).toBe('7000');
    });

    it('should handle multiple concurrent withdraws with insufficient total balance', async () => {
      const walletId = randomUUID();

      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [walletId, '10000'],
      );

      const withdraws = Array.from({ length: 5 }, () => ({
        transactionId: randomUUID(),
        amount: 3000,
      }));

      const responses = await Promise.all(
        withdraws.map((dto) =>
          request(app.getHttpServer())
            .post(`/wallet/${walletId}/withdraw`)
            .send(dto),
        ),
      );

      const successCount = responses.filter((r) => r.status === 200).length;
      const failureCount = responses.filter((r) => r.status === 409).length;

      expect(successCount).toBeLessThanOrEqual(3);
      expect(failureCount).toBeGreaterThanOrEqual(2);

      const wallet = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [walletId],
      );

      expect(parseInt(wallet[0].balance)).toBeGreaterThanOrEqual(0);
      expect(parseInt(wallet[0].balance)).toBeLessThanOrEqual(10000);
    });
  });
});
