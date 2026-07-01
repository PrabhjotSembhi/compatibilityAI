import type { ListQuery } from "@/server/domain/shared";
import { subscriptionRepository } from "@/server/domain/subscriptions/repository";
import type { CreateSubscriptionInput } from "@/server/domain/subscriptions/schemas";

export const subscriptionService = {
  list(query: ListQuery) {
    return subscriptionRepository.list(query);
  },

  create(input: CreateSubscriptionInput) {
    return subscriptionRepository.create(input);
  },
};
