import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { WalletTransferFormDto } from '../src/modules/wallet/dto/wallet.transfer.form.dto';

describe('Wallet Transfer (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sourceWalletId: string;
  let destinationWalletId: string;

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

    sourceWalletId = randomUUID();
    destinationWalletId = randomUUID();
    
    await dataSource.query(
      `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
      [sourceWalletId, '50000'],
    );
    
    await dataSource.query(
      `INSERT INTO wallets.wallets (id, balance) VALUES ($1, $2)`,
      [destinationWalletId, '10000'],
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /wallet/:id/transfer', () => {
    it('should successfully transfer funds between wallets', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 15000,
        toWalletId: destinationWalletId,
      };

      const response = await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: sourceWalletId,
        balance: 35000,
      });

      const destinationWallet = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [destinationWalletId],
      );
      expect(destinationWallet[0].balance).toBe('25000');
    });

    it('should return 409 when insufficient funds', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 60000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(409);
    });

    it('should return 409 when transaction ID already exists', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(409);
    });

    it('should return 400 when source and destination wallets are the same', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: sourceWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 404 when source wallet does not exist', async () => {
      const nonExistentWalletId = randomUUID();
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${nonExistentWalletId}/transfer`)
        .send(transferDto)
        .expect(404);
    });

    it('should return 404 when destination wallet does not exist', async () => {
      const nonExistentWalletId = randomUUID();
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: nonExistentWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(404);
    });

    it('should return 400 when amount is negative', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: -5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when amount is zero', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 0,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when amount is below minimum (100 cents)', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 99,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when amount exceeds maximum (100000000 cents)', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 100000001,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when transactionId is not a valid UUID', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: 'invalid-uuid',
        amount: 5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when toWalletId is not a valid UUID', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: 'invalid-uuid',
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when wallet ID is not a valid UUID', async () => {
      const transferDto: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post('/wallet/invalid-uuid/transfer')
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when transactionId is missing', async () => {
      const transferDto: Partial<WalletTransferFormDto> = {
        amount: 5000,
        toWalletId: destinationWalletId,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });

    it('should return 400 when toWalletId is missing', async () => {
      const transferDto: Partial<WalletTransferFormDto> = {
        transactionId: randomUUID(),
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post(`/wallet/${sourceWalletId}/transfer`)
        .send(transferDto)
        .expect(400);
    });
  });

  describe('Concurrent transfer scenarios', () => {
    it('should handle simultaneous transfers from User A to User B and User B to User A', async () => {
      const transferAtoB: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 10000,
        toWalletId: destinationWalletId,
      };

      const transferBtoA: WalletTransferFormDto = {
        transactionId: randomUUID(),
        amount: 5000,
        toWalletId: sourceWalletId,
      };

      const [responseAtoB, responseBtoA] = await Promise.all([
        request(app.getHttpServer())
          .post(`/wallet/${sourceWalletId}/transfer`)
          .send(transferAtoB),
        request(app.getHttpServer())
          .post(`/wallet/${destinationWalletId}/transfer`)
          .send(transferBtoA),
      ]);

      expect(responseAtoB.status).toBe(200);
      expect(responseBtoA.status).toBe(200);

      const walletA = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [sourceWalletId],
      );
      const walletB = await dataSource.query(
        'SELECT * FROM wallets.wallets WHERE id = $1',
        [destinationWalletId],
      );

      expect(walletA[0].balance).toBe('45000');
      expect(walletB[0].balance).toBe('15000');
    });
  });
});
