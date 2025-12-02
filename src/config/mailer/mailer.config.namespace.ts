import { registerAs } from '@nestjs/config';
import { MailerConfig } from './mailer.config';

export default registerAs('mailer', (): MailerConfig => {
  const { SMTP_HOST, SMTP_PORT } = process.env;
  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST is not defined in environment variables');
  }

  if (!SMTP_PORT) {
    throw new Error('SMTP_PORT is not defined in environment variables');
  }

  return {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
  };
});
