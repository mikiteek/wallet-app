## Run the application locally with all the necessary containerized services including:
 - wallet-service (our application)
 - rabbitmq (message broker)
 - postgres (database)
 - notification-service (our background consumer for sending emails)
 - maildev (smtp server for testing emails)
 - wallet-migrations (runs database migrations on startup and exits)

 Preconditions:
 - Docker and Docker Compose installed
 - Make sure you are in the project root folder in terminal
```bash

$ docker-compose --profile prod up -d
```
The flag `--profile prod` is used to run only the necessary services for running app.

The application will be running at `http://localhost:3000/`

You can configure ports in .env file

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
