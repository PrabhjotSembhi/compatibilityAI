import type { Prisma } from "@/generated/prisma/client";
import { aiInfrastructureService } from "@/server/ai/service";
import { computeCompatibilityRun } from "@/server/compatibility/engine";
import { compatibilityRepository } from "@/server/compatibility/repository";
import type {
  EvaluateCompatibilityInput,
  ExplainCompatibilityInput,
} from "@/server/compatibility/schemas";
import { matchService } from "@/server/domain/matches/service";
import { AppError } from "@/server/errors";

export const compatibilityService = {
  async evaluate(input: EvaluateCompatibilityInput) {
    const actor = await compatibilityRepository.getActor(input);

    if (!actor) {
      throw new AppError(
        "NOT_FOUND",
        "No compatibility profile found for the actor.",
      );
    }

    const candidates = await compatibilityRepository.listCandidates({
      actorUserId: input.actorUserId,
      relationshipContextId: input.relationshipContextId,
      candidateUserIds: input.candidateUserIds,
      candidateProfileIds: input.candidateProfileIds,
      includeLimitedProfiles: input.config?.includeLimitedProfiles ?? false,
      take: input.limit,
    });

    const run = computeCompatibilityRun({
      actor,
      candidates,
      config: input.config,
      relationshipContextId: input.relationshipContextId,
    });

    if (input.config?.persistMatches) {
      await Promise.all(
        run.results.map((result) =>
          matchService.create({
            relationshipContextId: result.relationshipContextId ?? undefined,
            actorUserId: result.actorUserId,
            candidateUserId: result.candidateUserId,
            actorProfileId: result.actorProfileId ?? undefined,
            candidateProfileId: result.candidateProfileId ?? undefined,
            status: "PROPOSED",
            hardFilters: toInputJsonObject(result.hardFilters),
            scoreBreakdown: {
              dimensions: result.scoreBreakdown,
              rank: result.rank,
            },
            finalScore: result.finalScore,
            explanation: toInputJsonObject(result.explanation),
          }),
        ),
      );
    }

    return run;
  },

  async explainWithAi(input: ExplainCompatibilityInput) {
    return aiInfrastructureService.generateStructured({
      userId: input.actorUserId,
      featureKey: "compatibility.explanation",
      promptTemplateKey: input.promptTemplateKey,
      schemaName: "compatibility_explanation",
      jsonSchema: compatibilityExplanationJsonSchema,
      model: input.model,
      variables: {
        evaluation_json: JSON.stringify(input.evaluation),
      },
      metadata: {
        source: "post_score_explanation",
      },
    });
  },
};

function toInputJsonObject(value: unknown) {
  return value as Prisma.InputJsonObject;
}

const compatibilityExplanationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    why_it_ranks_here: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    watchouts: { type: "array", items: { type: "string" } },
    next_questions: { type: "array", items: { type: "string" } },
  },
  required: [
    "summary",
    "why_it_ranks_here",
    "strengths",
    "watchouts",
    "next_questions",
  ],
};
