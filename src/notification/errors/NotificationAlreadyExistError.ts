export class NotificationAlreadyExistError extends Error {
  constructor(message: string = 'Notification already exists') {
    super(message);
  }
}
