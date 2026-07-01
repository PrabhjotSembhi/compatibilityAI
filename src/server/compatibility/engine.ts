import type { CompatibilityScoringConfig } from "@/server/compatibility/schemas";
import type {
  CompatibilityEvaluation,
  CompatibilityProfileSnapshot,
  CompatibilityRun,
  DimensionScore,
  HardFilterResult,
} from "@/server/compatibility/types";

const defaultWeights = {
  lifestyle: 20,
  personality: 20,
  interests: 15,
  values: 25,
  vector: 20,
};

export function computeCompatibilityRun(input: {
  actor: CompatibilityProfileSnapshot;
  candidates: CompatibilityProfileSnapshot[];
  config?: CompatibilityScoringConfig;
  relationshipContextId?: string | null;
}): CompatibilityRun {
  const config = {
    minimumFinalScore: 0,
    includeLimitedProfiles: false,
    persistMatches: false,
    ...input.config,
    weights: {
      ...defaultWeights,
      ...input.config?.weights,
    },
  };

  const evaluated = input.candidates.map((candidate) =>
    evaluateCandidate({
      actor: input.actor,
      candidate,
      config,
      relationshipContextId: input.relationshipContextId,
    }),
  );

  const passed = evaluated
    .filter(
      (evaluation) =>
        evaluation.hardFilters.passed &&
        evaluation.finalScore >= config.minimumFinalScore,
    )
    .sort(compareEvaluations)
    .map((evaluation, index) => ({
      ...evaluation,
      rank: index + 1,
    }));

  return {
    config,
    evaluatedAt: new Date().toISOString(),
    actorUserId: input.actor.userId,
    relationshipContextId: input.relationshipContextId,
    candidatesEvaluated: input.candidates.length,
    candidatesPassed: passed.length,
    results: passed,
  };
}

function evaluateCandidate(input: {
  actor: CompatibilityProfileSnapshot;
  candidate: CompatibilityProfileSnapshot;
  config: Required<CompatibilityScoringConfig>;
  relationshipContextId?: string | null;
}): CompatibilityEvaluation {
  const hardFilters = applyHardFilters(input);
  const scoreBreakdown = hardFilters.passed
    ? scoreDimensions(input.actor, input.candidate, input.config)
    : [];
  const finalScore = hardFilters.passed
    ? calculateWeightedScore(scoreBreakdown)
    : 0;

  return {
    actorUserId: input.actor.userId,
    candidateUserId: input.candidate.userId,
    actorProfileId: input.actor.profileId,
    candidateProfileId: input.candidate.profileId,
    relationshipContextId:
      input.relationshipContextId ??
      input.actor.relationshipContextId ??
      input.candidate.relationshipContextId,
    hardFilters,
    scoreBreakdown,
    finalScore,
    rank: 0,
    explanation: buildDeterministicExplanation(scoreBreakdown, hardFilters),
  };
}

function applyHardFilters(input: {
  actor: CompatibilityProfileSnapshot;
  candidate: CompatibilityProfileSnapshot;
  config: Required<CompatibilityScoringConfig>;
  relationshipContextId?: string | null;
}): HardFilterResult {
  const reasons: string[] = [];

  if (input.actor.userId === input.candidate.userId) {
    reasons.push("candidate_is_actor");
  }

  if (input.candidate.status && input.candidate.status !== "ACTIVE") {
    reasons.push("candidate_profile_not_active");
  }

  if (
    input.candidate.visibility === "PRIVATE" ||
    (!input.config.includeLimitedProfiles &&
      input.candidate.visibility === "LIMITED")
  ) {
    reasons.push("candidate_profile_not_discoverable");
  }

  const contextId =
    input.relationshipContextId ?? input.actor.relationshipContextId;
  if (
    contextId &&
    input.candidate.relationshipContextId &&
    input.candidate.relationshipContextId !== contextId
  ) {
    reasons.push("relationship_context_mismatch");
  }

  reasons.push(...applyConstraintFilters(input.actor, input.candidate));
  reasons.push(...applyDealBreakerFilters(input.actor, input.candidate));

  return {
    passed: reasons.length === 0,
    reasons,
  };
}

function scoreDimensions(
  actor: CompatibilityProfileSnapshot,
  candidate: CompatibilityProfileSnapshot,
  config: Required<CompatibilityScoringConfig>,
): DimensionScore[] {
  return [
    {
      dimension: "lifestyle",
      weight: config.weights.lifestyle,
      ...scoreObjectSimilarity(
        mergeObjects(actor.features?.lifestyle, actor.attributes?.lifestyle),
        mergeObjects(
          candidate.features?.lifestyle,
          candidate.attributes?.lifestyle,
        ),
      ),
    },
    {
      dimension: "personality",
      weight: config.weights.personality,
      ...scoreObjectSimilarity(
        buildPersonalityVector(actor),
        buildPersonalityVector(candidate),
      ),
    },
    {
      dimension: "interests",
      weight: config.weights.interests,
      ...scoreObjectSimilarity(actor.interests, candidate.interests),
    },
    {
      dimension: "values",
      weight: config.weights.values,
      ...scoreObjectSimilarity(actor.values, candidate.values),
    },
    {
      dimension: "vector",
      weight: config.weights.vector,
      ...scoreVectorSimilarity(actor.embedding, candidate.embedding),
    },
  ];
}

function applyConstraintFilters(
  actor: CompatibilityProfileSnapshot,
  candidate: CompatibilityProfileSnapshot,
) {
  const reasons: string[] = [];
  const requiredAttributes = readRecord(
    actor.constraints?.requiredCandidateAttributes,
  );
  const excludedUserIds = readStringArray(
    actor.constraints?.excludedCandidateUserIds,
  );

  if (excludedUserIds.includes(candidate.userId)) {
    reasons.push("candidate_excluded_by_actor");
  }

  for (const [key, expected] of Object.entries(requiredAttributes)) {
    if (!isCompatibleValue(expected, candidate.attributes?.[key])) {
      reasons.push(`required_attribute:${key}`);
    }
  }

  return reasons;
}

function applyDealBreakerFilters(
  actor: CompatibilityProfileSnapshot,
  candidate: CompatibilityProfileSnapshot,
) {
  return [
    ...compareDealBreakers(actor.dealBreakers, candidate.attributes, "actor"),
    ...compareDealBreakers(
      candidate.dealBreakers,
      actor.attributes,
      "candidate",
    ),
  ];
}

function compareDealBreakers(
  dealBreakers: CompatibilityProfileSnapshot["dealBreakers"],
  attributes: CompatibilityProfileSnapshot["attributes"],
  owner: string,
) {
  const reasons: string[] = [];
  const excluded = readRecord(dealBreakers?.excludedAttributes);
  const required = readRecord(dealBreakers?.requiredAttributes);

  for (const [key, blocked] of Object.entries(excluded)) {
    if (isCompatibleValue(blocked, attributes?.[key])) {
      reasons.push(`${owner}_deal_breaker:${key}`);
    }
  }

  for (const [key, expected] of Object.entries(required)) {
    if (!isCompatibleValue(expected, attributes?.[key])) {
      reasons.push(`${owner}_required_deal_breaker:${key}`);
    }
  }

  return reasons;
}

function scoreObjectSimilarity(
  left: unknown,
  right: unknown,
): Pick<DimensionScore, "score" | "signals"> {
  const leftRecord = readRecord(left);
  const rightRecord = readRecord(right);
  const keys = Array.from(
    new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)]),
  ).sort();

  if (keys.length === 0) {
    return { score: 50, signals: ["insufficient_structured_data"] };
  }

  const scores = keys.map((key) => ({
    key,
    score: scoreValueSimilarity(leftRecord[key], rightRecord[key]),
  }));

  const score = average(scores.map((item) => item.score));
  const strongest = scores
    .filter((item) => item.score >= 75)
    .slice(0, 3)
    .map((item) => `strong:${item.key}`);
  const weakest = scores
    .filter((item) => item.score < 45)
    .slice(0, 3)
    .map((item) => `gap:${item.key}`);

  return {
    score,
    signals: [...strongest, ...weakest],
  };
}

function scoreVectorSimilarity(
  left: number[],
  right: number[],
): Pick<DimensionScore, "score" | "signals"> {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return { score: 50, signals: ["embedding_unavailable"] };
  }

  const similarity = cosineSimilarity(left, right);

  return {
    score: Math.round(Math.max(0, similarity) * 10000) / 100,
    signals: ["embedding_similarity"],
  };
}

function scoreValueSimilarity(left: unknown, right: unknown): number {
  if (left === undefined || right === undefined) {
    return 50;
  }

  if (typeof left === "number" && typeof right === "number") {
    const distance = Math.min(Math.abs(left - right), 100);
    return clampScore(100 - distance);
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return left === right ? 100 : 0;
  }

  const leftValues = normalizeValues(left);
  const rightValues = normalizeValues(right);

  if (leftValues.length === 0 || rightValues.length === 0) {
    return 50;
  }

  return Math.round(jaccard(leftValues, rightValues) * 10000) / 100;
}

function isCompatibleValue(expected: unknown, actual: unknown) {
  if (Array.isArray(expected)) {
    const actualValues = normalizeValues(actual);
    return normalizeValues(expected).some((value) =>
      actualValues.includes(value),
    );
  }

  return scoreValueSimilarity(expected, actual) >= 99;
}

function calculateWeightedScore(scores: DimensionScore[]) {
  const activeScores = scores.filter((score) => score.weight > 0);
  const totalWeight = activeScores.reduce(
    (sum, score) => sum + score.weight,
    0,
  );

  if (activeScores.length === 0 || totalWeight === 0) {
    return 0;
  }

  const weighted = activeScores.reduce(
    (sum, score) => sum + score.score * score.weight,
    0,
  );

  return Math.round((weighted / totalWeight) * 100) / 100;
}

function buildDeterministicExplanation(
  scores: DimensionScore[],
  hardFilters: HardFilterResult,
) {
  if (!hardFilters.passed) {
    return {
      summary: "Candidate removed by hard filters.",
      reasons: hardFilters.reasons,
      strengths: [],
      watchouts: hardFilters.reasons,
    };
  }

  const ordered = [...scores].sort((left, right) => right.score - left.score);
  const strengths = ordered
    .filter((score) => score.score >= 70)
    .map((score) => score.dimension);
  const watchouts = ordered
    .filter((score) => score.score < 50)
    .map((score) => score.dimension);

  return {
    summary:
      "Deterministic compatibility score generated from structured data.",
    strengths,
    watchouts,
    signals: Object.fromEntries(
      scores.map((score) => [score.dimension, score.signals]),
    ),
  };
}

function buildPersonalityVector(profile: CompatibilityProfileSnapshot) {
  return {
    dimensions: profile.personality?.dimensions,
    communicationStyle: profile.personality?.communicationStyle,
    conflictStyle: profile.personality?.conflictStyle,
    attachmentStyle: profile.personality?.attachmentStyle,
  };
}

function compareEvaluations(
  left: CompatibilityEvaluation,
  right: CompatibilityEvaluation,
) {
  if (right.finalScore !== left.finalScore) {
    return right.finalScore - left.finalScore;
  }

  return left.candidateUserId.localeCompare(right.candidateUserId);
}

function cosineSimilarity(left: number[], right: number[]) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);

  return denominator === 0 ? 0 : dot / denominator;
}

function normalizeValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeValues);
  }

  if (typeof value === "string") {
    return value
      .toLowerCase()
      .split(/[\s,|/]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  return [];
}

function jaccard(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const union = new Set([...leftSet, ...rightSet]);
  const intersection = [...leftSet].filter((value) => rightSet.has(value));

  return union.size === 0 ? 0 : intersection.length / union.size;
}

function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function mergeObjects(...values: unknown[]) {
  return values.reduce<Record<string, unknown>>(
    (merged, value) => ({ ...merged, ...readRecord(value) }),
    {},
  );
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);

  return Math.round((sum / values.length) * 100) / 100;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}
