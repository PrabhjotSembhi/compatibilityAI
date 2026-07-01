import type { ListQuery } from "@/server/domain/shared";
import { profileRepository } from "@/server/domain/profiles/repository";
import type { CreateProfileInput } from "@/server/domain/profiles/schemas";

export const profileService = {
  list(query: ListQuery) {
    return profileRepository.list(query);
  },

  create(input: CreateProfileInput) {
    return profileRepository.create(input);
  },
};
