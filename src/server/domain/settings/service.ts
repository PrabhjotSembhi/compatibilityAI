import type { ListQuery } from "@/server/domain/shared";
import { userSettingsRepository } from "@/server/domain/settings/repository";
import type { CreateUserSettingsInput } from "@/server/domain/settings/schemas";

export const userSettingsService = {
  list(query: ListQuery) {
    return userSettingsRepository.list(query);
  },

  create(input: CreateUserSettingsInput) {
    return userSettingsRepository.create(input);
  },
};
