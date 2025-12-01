import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class NotificationService {
  constructor(private readonly logger: PinoLogger) {}

  sendEmail(email: string): void {
    this.logger.info(`Sending email notification ${email}`);
  }
}
