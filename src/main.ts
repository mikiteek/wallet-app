import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);

  await app.listen(port, () => {
    console.log(`Server is running on port ${port} !!!!!!!!!!!!`);
  });
}

bootstrap()
  .then(() => console.log('Server started successfully.'))
  .catch((err) => {
    console.log('Server up failed, exiting process', err);
    process.exit(1);
  });
