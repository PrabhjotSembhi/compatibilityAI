# Phase 4 AI Infrastructure

## Goal

Create reusable AI infrastructure that future features can share without duplicating provider calls, prompt rendering, structured output validation, retry behavior, rate limiting, or usage tracking.

## Included

- Prompt template model.
- Prompt version model.
- Active prompt version lookup.
- Structured output request schema.
- Prompt variable rendering using `{{variableName}}` placeholders.
- OpenAI Responses API provider adapter.
- Strict JSON-schema structured output request shape.
- Retry helper with exponential backoff and jitter.
- In-memory AI rate limiter for local/runtime protection.
- AI usage event persistence.
- Prompt template API endpoints.
- Structured generation API endpoint.
- Usage listing API endpoint.

## Not Included

- Product-specific prompts.
- Dating reports.
- Personality analysis features.
- Compatibility explanations.
- ChatGPT app/MCP exposure.
- Streaming responses.
- Vector embeddings.
- Provider fallback routing.

## Routes

- `GET /api/ai/prompt-templates`
- `POST /api/ai/prompt-templates`
- `POST /api/ai/generate-structured`
- `GET /api/ai/usage`

## Request Flow

1. Client calls `POST /api/ai/generate-structured`.
2. API validates request with Zod.
3. Service loads the active prompt version by `promptTemplateKey`.
4. Service renders prompt variables.
5. Rate limit is enforced.
6. OpenAI provider is called with strict structured output schema.
7. Response JSON is parsed.
8. Usage event is recorded with token and latency metadata.

## Database

Phase 4 adds:

- `PromptTemplate`
- `PromptVersion`
- `AiUsageEvent`
- `AiRateLimitBucket`

The migration file lives at `prisma/migrations/20260701020000_phase_4_ai_infrastructure/migration.sql`.

## Design Rule

Product features should call `aiInfrastructureService` instead of calling OpenAI directly. This keeps prompts versioned, costs visible, and provider behavior centralized.
