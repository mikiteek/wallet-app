# Wallet Application – Design Notes

## 1. System Overview
- **Wallet Service**: NestJS HTTP API (`src/main.ts`) exposing wallet operations; runs with global exception filtering for consistent error envelopes.
- **Notification Service**: NestJS context app (`src/notification.main.ts`) consuming async events and dispatching emails.
- **Dependencies**: PostgreSQL for persistence, RabbitMQ for event-driven workflows, Maildev for local email testing, TypeORM as ORM layer.

## 2. Service Boundaries & Rationale
- **Separated processes** (wallet vs notification) keep synchronous business logic isolated from notification side-effects, improving scalability and fault isolation at the cost of additional operational overhead.
- **NestJS modularity** chosen for its DI container, pipes/filters, and ecosystem familiarity, trading raw performance for developer velocity and structure.

## 3. Data & Messaging
- **PostgreSQL** selected for transactional guarantees and SQL richness; requires migration discipline but suits financial-domain consistency needs.
- **RabbitMQ events** decouple notification latency from user-facing flows and enable retries/dlq strategies, though they introduce eventual consistency and infrastructure complexity.

## 4. Architecture & Domain Patterns
- **Layered + Modular Monolith** within NestJS: configuration/logging/database modules remain reusable while feature areas (wallet, ledger, transaction, notification) encapsulate their own entities and repositories.
- **CQRS via `@nestjs/cqrs`**: command handlers (`CreateWalletHandler`, `DepositWalletHandler`, etc.) enforce aggregate invariants, while dedicated DTOs/projectors (`WalletViewDto`, `WalletOperationsListViewDto`) tailor read responses. This separation simplifies reasoning about state transitions but introduces boilerplate.
- **Domain Events & Publishers**: `WalletPublisher` bridges domain-side outcomes to RabbitMQ, enabling notification-service to react asynchronously without tight coupling to HTTP workflows.
- **Supporting Modules** (`TransactionModule`, `WalletOperationModule`) act as domain services, promoting DDD-style aggregates (Wallet + Ledger) even though everything resides in a single repo.

## 5. Transactional Flow & Idempotency
- **Deposit/Withdraw**:
  1. Controller validates DTOs and dispatches command.
  2. Command handler loads wallet + operations inside a TypeORM transaction.
  3. Balance mutation plus `WalletOperationEntity` append occur atomically.
  4. `TransactionModule` records the client-supplied transactionId; duplicate detection raises `TransactionAlreadyExistsError`, ensuring idempotency for retries.
  5. Commit triggers domain event emission → RabbitMQ → notification-service.
- **Transfer**:
  1. Source wallet locked/validated; destination resolved via service.
  2. Funds deducted/credited in one DB transaction so both legs succeed or rollback together.
  3. Ledger receives paired debit/credit entries for auditability.
- **History Reads** leverage `FetchWalletOperationsHandler` to project chronological operations without touching mutation paths, guarding write-model performance.

## 6. Concurrency, Locking & Ordering
- **Database-Level Guarantees**: Wallet mutations should wrap in Postgres transactions using TypeORM `QueryRunner` with `pessimistic_write` locks (`SELECT ... FOR UPDATE`) to serialize access to a wallet row. This prevents double-spend scenarios at the cost of blocking under heavy contention.
- **Consistency vs Throughput Trade-off**: Choosing strict serial ordering keeps balances correct but may reduce throughput when many concurrent operations hit the same wallet. Sharding wallets or adopting optimistic + retry logic would improve scalability but complicate error handling.
- **Idempotent Transaction IDs**: Unique constraints on the transaction table eliminate duplicate processing when HTTP clients retry after network failures.
- **Message Handling**: RabbitMQ ACK/NACK semantics (managed by notification-service) ensure notifications are eventually delivered. However, event processing is asynchronous, so external observers may see notification lag relative to wallet mutations.
- **Ordering Guarantees**: Within a single wallet, ledger entries inherit DB transaction order; across wallets, eventual consistency applies once events leave the service boundary.

