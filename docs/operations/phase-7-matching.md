# Phase 7 - Matching

## Goal

Phase 7 turns the deterministic compatibility engine into matching workflows. It does not add messaging, chat, inboxes, introductions, or acceptance flows.

## Backend Boundary

The matching layer lives under `src/server/matching` and reuses `src/server/compatibility`.

- Candidate filtering uses the compatibility repository and hard filters through the Phase 6 engine.
- Ranking is produced by the deterministic Phase 6 score and tie-break rules.
- Match recommendations are ranked result packets and may optionally persist `Match` records.
- Compatibility reports are saved as `Report` records with the full scored evaluation payload.

## API

`POST /api/matching/candidates`

Returns candidates that pass filtering and minimum score configuration.

`POST /api/matching/recommendations`

Returns ranked match recommendations. By default this persists proposed `Match` records so the product can later build review, acceptance, or marketplace flows.

`POST /api/matching/reports`

Creates a deterministic compatibility report for a selected candidate. AI explanation is optional and only receives the completed score payload.

## Example Recommendation Request

```json
{
  "actorUserId": "user_123",
  "relationshipContextId": "ctx_123",
  "limit": 10,
  "minimumFinalScore": 65,
  "persistMatches": true,
  "weights": {
    "lifestyle": 20,
    "personality": 20,
    "interests": 15,
    "values": 25,
    "vector": 20
  }
}
```

## Not Included

- Messaging
- Mutual acceptance workflow
- Notifications for match events
- Paid boosts or marketplace ranking changes
- Human moderation queues
