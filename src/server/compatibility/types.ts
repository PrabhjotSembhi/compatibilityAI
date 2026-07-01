import type { CompatibilityScoringConfig } from "@/server/compatibility/schemas";

export type CompatibilityJson = Record<string, unknown>;

export type CompatibilityProfileSnapshot = {
  userId: string;
  profileId?: string | null;
  relationshipContextId?: string | null;
  status?: string | null;
  visibility?: string | null;
  city?: string | null;
  country?: string | null;
  languages: string[];
  attributes?: CompatibilityJson | null;
  preferences?: CompatibilityJson | null;
  constraints?: CompatibilityJson | null;
  features?: CompatibilityJson | null;
  values?: CompatibilityJson | null;
  interests?: CompatibilityJson | null;
  dealBreakers?: CompatibilityJson | null;
  embedding: number[];
  personality?: {
    dimensions?: CompatibilityJson | null;
    strengths?: CompatibilityJson | null;
    blindSpots?: CompatibilityJson | null;
    communicationStyle?: string | null;
    conflictStyle?: string | null;
    attachmentStyle?: string | null;
  } | null;
};

export type HardFilterResult = {
  passed: boolean;
  reasons: string[];
};

export type DimensionScore = {
  dimension: "lifestyle" | "personality" | "interests" | "values" | "vector";
  score: number;
  weight: number;
  signals: string[];
};

export type CompatibilityEvaluation = {
  actorUserId: string;
  candidateUserId: string;
  actorProfileId?: string | null;
  candidateProfileId?: string | null;
  relationshipContextId?: string | null;
  hardFilters: HardFilterResult;
  scoreBreakdown: DimensionScore[];
  finalScore: number;
  rank: number;
  explanation: CompatibilityJson;
};

export type CompatibilityRun = {
  config: CompatibilityScoringConfig;
  evaluatedAt: string;
  actorUserId: string;
  relationshipContextId?: string | null;
  candidatesEvaluated: number;
  candidatesPassed: number;
  results: CompatibilityEvaluation[];
};
