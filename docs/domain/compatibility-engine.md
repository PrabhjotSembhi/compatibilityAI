# Compatibility Engine

## Responsibility

The compatibility engine performs deterministic filtering, scoring, ranking, and explanation generation from structured profile data and relationship-context configuration.

AI may help generate the structured inputs, but the engine should produce repeatable outputs for the same inputs and configuration.

## Pipeline

1. Select relationship context.
2. Load user profile, preferences, constraints, and visibility settings.
3. Load candidate pool allowed by privacy, consent, and marketplace policy.
4. Apply hard filters.
5. Score candidates across configured dimensions.
6. Apply ranking and tie-break rules.
7. Return ranked candidates with structured explanation data.
8. Log match evaluation metadata for debugging, audit, and improvement.

## Matching Dimensions

Dimensions should be configurable by relationship context. Examples:

- Values alignment
- Goals alignment
- Lifestyle compatibility
- Communication style
- Availability
- Location or distance constraints
- Professional complementarity
- Interest overlap
- Personality fit
- Deal-breaker satisfaction

## Design Requirements

- Deterministic outputs for identical inputs.
- Explainable scoring dimensions.
- Testable filtering and ranking behavior.
- Configurable weights by relationship context.
- Clear separation between hard constraints and soft preferences.
- Privacy-aware candidate retrieval.
- Version-aware profile evaluation.

## AI Boundary

AI can assist with:

- Creating structured profile attributes.
- Updating stale or incomplete profile fields.
- Translating score outputs into friendly explanations.
- Suggesting questions to improve profile quality.

AI should not directly decide candidate eligibility, final rank, or visibility.

## Phase 6 Implementation

The first backend implementation lives in `src/server/compatibility`.

- Deterministic evaluation endpoint: `POST /api/compatibility/evaluate`
- Post-score AI explanation endpoint: `POST /api/compatibility/explain`
- Pure algorithm entry point: `computeCompatibilityRun`

The engine currently uses configurable weights for lifestyle, personality, interests, values, and vector similarity. Hard filters execute before scoring, and failed candidates are removed from ranked results.
