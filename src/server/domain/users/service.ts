import { userRepository } from "@/server/domain/users/repository";
import type { UserListQuery } from "@/server/domain/users/schemas";

export const userService = {
  list(query: UserListQuery) {
    return userRepository.list(query);
  },
};
