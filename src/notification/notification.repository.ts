import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { NotificationEntity } from './notification.entity';
import { Notification } from './notification';
import { PostgresErrCodes } from '../common/constants';
import { NotificationAlreadyExistError } from './errors';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityPool: EntityManager,

    private readonly logger: PinoLogger,
  ) {}

  async create(notification: Notification): Promise<boolean> {
    const notificationEntity = this.entityPool.create<
      NotificationEntity,
      Notification
    >(NotificationEntity, notification);

    try {
      await this.entityPool.insert(NotificationEntity, notificationEntity);
      return true;
    } catch (error) {
      if (error?.code === PostgresErrCodes.UNIQUE_VIOLATION) {
        const errorMessage = `Notification already exists notificationId=${notification.id}`;
        this.logger.warn(errorMessage);

        throw new NotificationAlreadyExistError(errorMessage);
      }

      throw error;
    }
  }
}
