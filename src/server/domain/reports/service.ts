import type { ListQuery } from "@/server/domain/shared";
import { reportRepository } from "@/server/domain/reports/repository";
import type { CreateReportInput } from "@/server/domain/reports/schemas";

export const reportService = {
  list(query: ListQuery) {
    return reportRepository.list(query);
  },

  create(input: CreateReportInput) {
    return reportRepository.create(input);
  },
};
