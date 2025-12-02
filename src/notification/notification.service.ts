import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { MailService } from './mail/mail.service';
import { NotificationRepository } from './notification.repository';
import { Notification } from './notification';
import { NotificationType } from './notification.entity';

// we do not have authentification
// mock recipient email
const TO_EMAIL = 'example@email.com';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly mailService: MailService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async persistNotification(
    notificationId: string,
    type: NotificationType,
    title: string,
    text: string,
  ): Promise<void> {
    const notification: Notification = {
      id: notificationId,
      type,
      title,
      message: text,
      emailAddress: TO_EMAIL,
    };

    await this.notificationRepository.create(notification);
  }

  async sendEmail(subject: string, message: string): Promise<void> {
    await this.mailService.sendEmail(TO_EMAIL, subject, message);
  }
}
