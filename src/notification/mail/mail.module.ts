import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { MailService } from './mail.service';
import { MailerConfig } from '../../config/mailer/mailer.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      inject: [ConfigService],
      provide: 'MAIL_TRANSPORTER',
      useFactory: (configService: ConfigService) => {
        const mailerConfig = configService.get<MailerConfig>('mailer');
        if (!mailerConfig) {
          throw new Error('Missing mailer config');
        }

        return createTransport({
          host: mailerConfig.host, // SMTP_HOST, smtp.mailtrap.io
          port: mailerConfig.port, // SMTP_PORT, 1025
          secure: false,
        });
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
