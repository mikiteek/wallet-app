import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';

describe('Wallet Fetch (e2e)', () => {
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
    
    let retries = 5;
    while (retries > 0) {
      try {
        await dataSource.query('SELECT 1');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE wallets.notifications CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallet_operations CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.transactions CASCADE');
    await dataSource.query('TRUNCATE TABLE wallets.wallets CASCADE');

    testWalletId = randomUUID();
    await dataSource.query(
      `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
      [testWalletId, '25000'],
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /wallet/:id', () => {
    it('should successfully fetch wallet by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/wallet/${testWalletId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testWalletId,
        balance: 25000,
      });
    });

    it('should return wallet with zero balance', async () => {
      const zeroBalanceWalletId = randomUUID();
      await dataSource.query(
        `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
        [zeroBalanceWalletId, '0'],
      );

      const response = await request(app.getHttpServer())
        .get(`/wallet/${zeroBalanceWalletId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: zeroBalanceWalletId,
        balance: 0,
      });
    });

    it('should return 404 when wallet does not exist', async () => {
      const nonExistentWalletId = randomUUID();

      await request(app.getHttpServer())
        .get(`/wallet/${nonExistentWalletId}`)
        .expect(404);
    });

    it('should return 400 when wallet ID is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/wallet/invalid-uuid')
        .expect(400);
    });
  });
});
