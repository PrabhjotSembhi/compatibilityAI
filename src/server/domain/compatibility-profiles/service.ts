import type { ListQuery } from "@/server/domain/shared";
import { compatibilityProfileRepository } from "@/server/domain/compatibility-profiles/repository";
import type { CreateCompatibilityProfileInput } from "@/server/domain/compatibility-profiles/schemas";

export const compatibilityProfileService = {
  list(query: ListQuery) {
    return compatibilityProfileRepository.list(query);
  },

  create(input: CreateCompatibilityProfileInput) {
    return compatibilityProfileRepository.create(input);
  },
};
