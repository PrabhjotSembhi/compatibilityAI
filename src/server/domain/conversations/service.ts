import type { ListQuery } from "@/server/domain/shared";
import { conversationRepository } from "@/server/domain/conversations/repository";
import type { CreateConversationInput } from "@/server/domain/conversations/schemas";

export const conversationService = {
  list(query: ListQuery) {
    return conversationRepository.list(query);
  },

  create(input: CreateConversationInput) {
    return conversationRepository.create(input);
  },
};
