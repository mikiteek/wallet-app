export class NotificationAlreadyExistsError extends Error {
  constructor(message: string = 'Notification already exists') {
    super(message);
  }
}
