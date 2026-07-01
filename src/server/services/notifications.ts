import { logger } from "@/server/logger";

export type NotificationMessage = {
  userId: string;
  title: string;
  body: string;
  channel: "in_app" | "push";
};

export interface NotificationService {
  send(message: NotificationMessage): Promise<void>;
}

export class NoopNotificationService implements NotificationService {
  async send(message: NotificationMessage): Promise<void> {
    logger.info("Notification skipped by noop provider.", {
      channel: message.channel,
      userId: message.userId,
    });
  }
}

export const notificationService: NotificationService =
  new NoopNotificationService();
