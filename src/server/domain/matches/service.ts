import type { ListQuery } from "@/server/domain/shared";
import { matchRepository } from "@/server/domain/matches/repository";
import type { CreateMatchInput } from "@/server/domain/matches/schemas";

export const matchService = {
  list(query: ListQuery) {
    return matchRepository.list(query);
  },

  create(input: CreateMatchInput) {
    return matchRepository.create(input);
  },
};
