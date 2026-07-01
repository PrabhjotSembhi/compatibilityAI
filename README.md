# Compatibility AI

Compatibility AI is an AI Compatibility Platform. Dating is the first application, but the core product is a reusable compatibility engine for many relationship contexts: friendship, co-founder discovery, professional networking, mentoring, groups, travel partners, study partners, and team formation.

This repository is being built phase by phase. Phase 2 is complete at the codebase level: reusable core infrastructure exists, with no product or dating features.

## Current Phase

Phase 2: Core Infrastructure

Included:

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui configuration
- Prisma 7 configured for PostgreSQL
- Prisma PostgreSQL adapter
- Better Auth route shell
- Better Auth core database models and migration
- Zod validation
- ESLint and Prettier
- GitHub Actions CI
- Environment variable template
- Environment validation
- Shared API response and error helpers
- Structured logging wrapper
- App and database health-check routes
- AI, storage, and notification service interfaces

Not included yet:

- Dating features
- AI reports
- Structured compatibility profile models
- Compatibility scoring
- Matching
- Messaging
- Payments
- Email service

## Product Direction

- AI generates and updates structured user profiles.
- Backend services perform deterministic filtering, scoring, ranking, consent checks, and privacy enforcement.
- AI explains compatibility after deterministic scoring; AI does not decide compatibility.
- Domain models should stay relationship-context neutral wherever possible.

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npx prisma format
npm run prisma:generate
npm run check
npm run build
```

## Documentation

- `docs/product/vision.md` - product purpose and long-term platform direction.
- `docs/product/roadmap.md` - phased product evolution.
- `docs/architecture/principles.md` - architectural rules and constraints.
- `docs/architecture/system-overview.md` - conceptual system boundaries.
- `docs/domain/domain-model.md` - reusable compatibility domain concepts.
- `docs/domain/compatibility-engine.md` - deterministic matching philosophy.
- `docs/operations/phase-1-foundation.md` - Phase 1 implementation notes.
- `docs/operations/phase-2-core-infrastructure.md` - Phase 2 implementation notes.
- `docs/operations/environment.md` - environment variable reference.
