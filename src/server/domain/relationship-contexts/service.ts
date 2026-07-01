import type { ListQuery } from "@/server/domain/shared";
import { relationshipContextRepository } from "@/server/domain/relationship-contexts/repository";
import type { CreateRelationshipContextInput } from "@/server/domain/relationship-contexts/schemas";

export const relationshipContextService = {
  list(query: ListQuery) {
    return relationshipContextRepository.list(query);
  },

  create(input: CreateRelationshipContextInput) {
    return relationshipContextRepository.create(input);
  },
};
