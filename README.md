## Run the application or tests locally with all the necessary containerized services including:
 - wallet-service (our application)
 - rabbitmq (message broker)
 - postgres (database)
 - notification-service (our background consumer for sending emails)
 - maildev (smtp server for testing emails)
 - wallet-migrations (runs database migrations on startup and exits)

 Preconditions:
 - Docker and Docker Compose installed
 - Make sure you are in the project root folder in terminal
 - Create a `.env` file based on the `.env.example` in the root of project file and adjust values if needed. You can just copy values from `.env.example` for running locally purposes.

```bash
### Run application in docker containers
$ docker-compose up -d

### Run e2e tests in docker containers and see the logs in the terminal
$ docker-compose -f docker-compose.test.yml up --abort-on-container-exit wallet-service-e2e

### If you changed anything and want to rebuild the containers you should:
# - remove the existing containers first
$ docker-compose down -v --remove-orphans

# - build containers without cache
$ docker-compose build --no-cache
```
A separate docker-compose.test.yml file is provided for running e2e tests in isolation. So use the flag `-f docker-compose.test.yml` to run the tests, remove or rebuild the test containers.

The application will be running at `http://localhost:3000/`

You can configure ports in .env file

## API Contracts

### 1. Deposit Funds
**POST** `/wallet/:id/deposit`

Deposits funds into a wallet.

**Path Parameters:**
- `id` (UUID) - Wallet identifier

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 5000
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 15000
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `409 Conflict` - Wallet or transaction already exists

---

### 2. Withdraw Funds
**POST** `/wallet/:id/withdraw`

Withdraws funds from a wallet.

**Path Parameters:**
- `id` (UUID) - Wallet identifier

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 5000
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 10000
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Wallet not found
- `409 Conflict` - Transaction already exists or insufficient funds

---

### 3. Transfer Funds
**POST** `/wallet/:id/transfer`

Transfers funds from one wallet to another.

**Path Parameters:**
- `id` (UUID) - Source wallet identifier

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 5000,
  "toWalletId": "650e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 5000
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data or transfer validation error
- `404 Not Found` - Wallet not found
- `409 Conflict` - Transaction already exists or insufficient funds

---

### 4. Get Wallet History
**GET** `/wallet/:id/history`

Retrieves the operation history for a wallet.

**Path Parameters:**
- `id` (UUID) - Wallet identifier

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "1",
      "walletId": "550e8400-e29b-41d4-a716-446655440000",
      "transactionId": "650e8400-e29b-41d4-a716-446655440000",
      "entryType": "credit",
      "amount": 5000,
      "balanceBefore": 10000,
      "balanceAfter": 15000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Wallet not found

---

### 5. Get Wallet Details
**GET** `/wallet/:id`

Retrieves the current state of a wallet.

**Path Parameters:**
- `id` (UUID) - Wallet identifier

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 15000
}
```

**Error Responses:**
- `404 Not Found` - Wallet not found

---

**Notes:**
- All amounts are in cents (e.g., 5000 = $50.00)
- Minimum amount: 100 cents ($1.00)
- Maximum amount: 100,000,000 cents ($100,000,0)
- All monetary values are integers
- Entry types: `debit` (money out) or `credit` (money in)

## Project Structure

```
wallet-app/
├── src/
│   ├── common/                    # Shared utilities and helpers
│   ├── config/                    # Configuration files
│   ├── database/                  # Database configuration and migrations
│   │   └── migrations/            # TypeORM migrations
│   ├── modules/
│   │   ├── wallet/                # Wallet module
│   │   │   ├── controllers/       # REST API controllers
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── entities/          # TypeORM entities
│   │   │   ├── errors/            # Custom error classes
│   │   │   ├── services/          # Business logic services
│   │   │   └── wallet.module.ts
│   │   ├── ledger/                # Ledger module (wallet operations history)
│   │   │   ├── dto/
│   │   │   ├── entities/          # Ledger entries
│   │   │   ├── services/
│   │   │   └── ledger.module.ts
│   │   ├── transaction/           # Transaction module
│   │   │   ├── entities/
│   │   │   ├── errors/
│   │   │   ├── services/
│   │   │   └── transaction.module.ts
│   │── notification/              # Notification module (RabbitMQ consumer)
│   |── rabbitmq/                  # RabbitMQ module
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application entry point
│   └── notification.main.ts       # Notification process entry point
├── test/                          # E2E tests
├── docker-compose.yml             # Docker services configuration
├── Dockerfile                     # Application container
└── package.json
```

### Key Components

- **Wallet Module**: Handles wallet operations (deposit, withdraw, transfer)
- **Ledger Module**: Records all wallet operations with double-entry bookkeeping
- **Transaction Module**: Manages transaction idempotency and state
- **Notification Module**: Sends email notifications on consuming RabbitMQ events
- **Database Migrations**: TypeORM migrations for schema management

### Migrations on development stage
More info about migrations using TypeOrm see here https://typeorm.io/migrations#
#### Create migrations
```
$ npx typeorm-ts-node-commonjs migration:create src/database/migrations/{the_name_of_the_migration}
```
#### Run migrations
```
$ npm run migrations:run
```
#### Down last migrations
```
$ npm run migrations:down
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
