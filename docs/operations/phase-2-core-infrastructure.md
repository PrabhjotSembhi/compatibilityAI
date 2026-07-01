# Phase 2 Core Infrastructure

## Goal

Build reusable backend infrastructure without adding dating features, matching features, reports, payments, email, or social flows.

## Included

- Environment validation with Zod.
- Shared API response helpers.
- Application error type with HTTP status mapping.
- Structured logger wrapper.
- Request validation helper.
- Prisma client singleton using the PostgreSQL driver adapter required by Prisma 7.
- Better Auth server configuration and Next.js route shell.
- Better Auth core Prisma models and migration.
- App health check route.
- Database health check route.
- AI service interface.
- File storage service interface.
- Notification service interface with a no-op implementation.

## Not Included

- Email service. It is intentionally deferred.
- Dating-specific entities.
- Profile schemas.
- Compatibility scoring.
- AI prompts.
- Structured output generation.
- File upload implementation.
- Push notification provider implementation.
- Payment providers.
- Applied production database migration. The migration is committed in the repo but should be applied only when the target database credentials are confirmed.

## Boundaries

Auth, database, AI, storage, notifications, validation, and API response behavior are separate infrastructure concerns. Product modules should consume these through interfaces rather than importing provider SDKs directly.

## Routes

- `GET /api/health`: Confirms the application server is responding.
- `GET /api/health/db`: Confirms the configured PostgreSQL database is reachable.
- `/api/auth/[...all]`: Better Auth route shell for future auth flows.

## API Shape

Successful responses should use:

```json
{
  "data": {}
}
```

Error responses should use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid.",
    "details": {}
  }
}
```

## Database

Phase 2 adds only infrastructure tables used by Better Auth:

- `User`
- `Session`
- `Account`
- `Verification`

The migration file lives at `prisma/migrations/20260701000000_phase_2_auth_infrastructure/migration.sql`.

Apply it only after confirming `.env` points to the intended database:

```bash
npx prisma migrate deploy
```

## Secrets

The secrets pasted during setup should be rotated because they were exposed in chat. After rotation, update `.env` locally. Do not commit real secrets.

## Next Phase

Phase 3 should introduce core domain models intentionally. User profile, compatibility profile, report, and marketplace entities should be designed before additional migrations are applied.
