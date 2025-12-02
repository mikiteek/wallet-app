import { NotificationEntity } from './notification.entity';

export type Notification = Pick<
  NotificationEntity,
  'id' | 'type' | 'title' | 'message' | 'emailAddress'
>;
