import type { ListQuery } from "@/server/domain/shared";
import { notificationRepository } from "@/server/domain/notifications/repository";
import type { CreateNotificationInput } from "@/server/domain/notifications/schemas";

export const notificationDomainService = {
  list(query: ListQuery) {
    return notificationRepository.list(query);
  },

  create(input: CreateNotificationInput) {
    return notificationRepository.create(input);
  },
};
