import type { ListQuery } from "@/server/domain/shared";
import { personalityProfileRepository } from "@/server/domain/personality-profiles/repository";
import type { CreatePersonalityProfileInput } from "@/server/domain/personality-profiles/schemas";

export const personalityProfileService = {
  list(query: ListQuery) {
    return personalityProfileRepository.list(query);
  },

  create(input: CreatePersonalityProfileInput) {
    return personalityProfileRepository.create(input);
  },
};
