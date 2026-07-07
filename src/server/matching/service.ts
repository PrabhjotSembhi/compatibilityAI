import type { Prisma } from "@/generated/prisma/client";
import { compatibilityService } from "@/server/compatibility/service";
import type { CompatibilityEvaluation } from "@/server/compatibility/types";
import { reportService } from "@/server/domain/reports/service";
import { AppError } from "@/server/errors";
import type {
  CreateCompatibilityReportInput,
  FilterCandidatesInput,
  RecommendMatchesInput,
} from "@/server/matching/schemas";

const defaultWeights = {
  lifestyle: 20,
  personality: 20,
  interests: 15,
  values: 25,
  vector: 20,
};

export const matchingService = {
  async filterCandidates(input: FilterCandidatesInput) {
    const run = await compatibilityService.evaluate({
      actorUserId: input.actorUserId,
      actorProfileId: input.actorProfileId,
      relationshipContextId: input.relationshipContextId,
      candidateUserIds: input.candidateUserIds,
      candidateProfileIds: input.candidateProfileIds,
      limit: input.limit,
      config: {
        includeLimitedProfiles: input.includeLimitedProfiles,
        minimumFinalScore: input.minimumFinalScore,
        persistMatches: false,
        weights: input.weights ?? defaultWeights,
      },
    });

    return {
      actorUserId: run.actorUserId,
      relationshipContextId: run.relationshipContextId,
      candidatesEvaluated: run.candidatesEvaluated,
      candidatesPassed: run.candidatesPassed,
      filters: {
        includeLimitedProfiles: input.includeLimitedProfiles,
        minimumFinalScore: input.minimumFinalScore,
      },
      candidates: run.results.map(toCandidateSummary),
    };
  },

  async recommendMatches(input: RecommendMatchesInput) {
    const run = await compatibilityService.evaluate({
      actorUserId: input.actorUserId,
      actorProfileId: input.actorProfileId,
      relationshipContextId: input.relationshipContextId,
      candidateUserIds: input.candidateUserIds,
      candidateProfileIds: input.candidateProfileIds,
      limit: input.limit,
      config: {
        includeLimitedProfiles: input.includeLimitedProfiles,
        minimumFinalScore: input.minimumFinalScore,
        persistMatches: input.persistMatches,
        weights: input.weights ?? defaultWeights,
      },
    });

    return {
      actorUserId: run.actorUserId,
      relationshipContextId: run.relationshipContextId,
      generatedAt: run.evaluatedAt,
      persistedMatches: input.persistMatches,
      recommendations: run.results.map(toRecommendation),
    };
  },

  async createCompatibilityReport(input: CreateCompatibilityReportInput) {
    const run = await compatibilityService.evaluate({
      actorUserId: input.actorUserId,
      actorProfileId: input.actorProfileId,
      relationshipContextId: input.relationshipContextId,
      candidateUserIds: input.candidateUserId
        ? [input.candidateUserId]
        : undefined,
      candidateProfileIds: input.candidateProfileId
        ? [input.candidateProfileId]
        : undefined,
      limit: 1,
      config: {
        includeLimitedProfiles: input.includeLimitedProfiles,
        persistMatches: false,
        minimumFinalScore: input.config?.minimumFinalScore ?? 0,
        weights: input.config?.weights ?? defaultWeights,
      },
    });

    const evaluation = run.results[0];

    if (!evaluation) {
      throw new AppError(
        "NOT_FOUND",
        "No eligible candidate found for this compatibility report.",
      );
    }

    const aiExplanation = input.includeAiExplanation
      ? await compatibilityService.explainWithAi({
          actorUserId: input.actorUserId,
          promptTemplateKey:
            input.promptTemplateKey ?? "compatibility.explanation.v1",
          model: input.model,
          evaluation: toInputJsonObject(evaluation),
        })
      : null;

    const report = await reportService.create({
      userId: input.actorUserId,
      profileId: evaluation.actorProfileId ?? undefined,
      relationshipContextId: evaluation.relationshipContextId ?? undefined,
      type: "compatibility_report",
      title: "Compatibility Report",
      status: "READY",
      summary: buildReportSummary(evaluation),
      payload: toInputJsonObject({
        source: "matching_service",
        evaluation,
        aiExplanation: aiExplanation?.output ?? null,
      }),
      shareable: false,
    });

    return {
      report,
      evaluation,
      aiExplanation: aiExplanation?.output ?? null,
    };
  },
};

function toCandidateSummary(evaluation: CompatibilityEvaluation) {
  return {
    candidateUserId: evaluation.candidateUserId,
    candidateProfileId: evaluation.candidateProfileId,
    rank: evaluation.rank,
    finalScore: evaluation.finalScore,
    hardFilters: evaluation.hardFilters,
  };
}

function toRecommendation(evaluation: CompatibilityEvaluation) {
  return {
    candidateUserId: evaluation.candidateUserId,
    candidateProfileId: evaluation.candidateProfileId,
    rank: evaluation.rank,
    finalScore: evaluation.finalScore,
    scoreBreakdown: evaluation.scoreBreakdown,
    explanation: evaluation.explanation,
  };
}

function buildReportSummary(evaluation: CompatibilityEvaluation) {
  return `Candidate ${evaluation.candidateUserId} ranked #${evaluation.rank} with a ${evaluation.finalScore} compatibility score.`;
}

function toInputJsonObject(value: unknown) {
  return value as Prisma.InputJsonObject;
}
