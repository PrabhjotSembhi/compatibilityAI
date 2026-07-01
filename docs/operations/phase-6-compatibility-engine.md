# Phase 6 - Compatibility Engine

## Goal

Phase 6 adds deterministic matching. AI can generate structured profile inputs and can rewrite explanations after scoring, but it does not decide eligibility, score, or rank.

## Backend Boundary

The compatibility engine is implemented under `src/server/compatibility`:

- `schemas.ts` validates public API inputs.
- `repository.ts` loads actor and candidate compatibility snapshots.
- `engine.ts` applies hard filters, dimension scoring, vector similarity, final score calculation, and ranking.
- `service.ts` coordinates data loading, pure scoring, optional match persistence, and optional post-score AI explanation generation.

## Pipeline

1. Load the actor compatibility profile.
2. Load candidates by relationship context, visibility, status, optional user IDs, and optional profile IDs.
3. Apply hard filters.
4. Score lifestyle, personality, interests, values, and vector similarity.
5. Compute weighted final score.
6. Sort by final score descending, then stable candidate user ID tie-break.
7. Return ranked results with deterministic explanation data.
8. Optionally persist ranked results as `Match` records.

## API

`POST /api/compatibility/evaluate`

Runs deterministic scoring and ranking.

```json
{
  "actorUserId": "user_123",
  "relationshipContextId": "ctx_123",
  "limit": 25,
  "config": {
    "persistMatches": false,
    "minimumFinalScore": 60,
    "weights": {
      "lifestyle": 20,
      "personality": 20,
      "interests": 15,
      "values": 25,
      "vector": 20
    }
  }
}
```

`POST /api/compatibility/explain`

Uses the shared AI infrastructure only after a scored evaluation exists.

## Algorithm Notes

The first algorithm is intentionally simple and inspectable:

- structured objects score by shared keys and value similarity
- arrays and strings score by Jaccard overlap
- numbers score by closeness
- booleans require equality
- vectors score by cosine similarity
- missing data is neutral at `50`
