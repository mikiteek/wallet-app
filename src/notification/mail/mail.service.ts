import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_TRANSPORTER') private readonly transporter: Transporter,
    private readonly logger: PinoLogger,
  ) {}

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    this.logger.info(
      `Sending email to ${to} with subject: ${subject}, message: ${text}`,
    );
    try {
      await this.transporter.sendMail({
        from: '"Wallet Service" <no-reply@wallet.com>',
        to,
        subject,
        text,
      });

      this.logger.info(
        'Email sent successfully to %s, subject %s, text %s',
        to,
        subject,
        text,
      );
    } catch (error) {
      this.logger.error('Error sending email');
      this.logger.error(error);

      throw error;
    }
  }
}
