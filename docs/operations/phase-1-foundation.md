# Phase 1 Foundation

## Goal

Create a production-ready empty application for the AI Compatibility Platform. This phase does not include product features, matching, reports, AI workflows, payments, messaging, or marketplace behavior.

## Included

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui project configuration
- Prisma 7 configured for PostgreSQL
- Better Auth dependency installed for future auth wiring
- Zod installed for future input validation
- Prettier formatting configuration
- ESLint via Next.js
- GitHub Actions CI workflow
- Environment variable template

## Explicitly Not Included

- Dating-specific implementation
- Compatibility scoring
- AI prompts or structured output flows
- Authentication screens
- Database domain models
- Payments
- Messaging
- Marketplace matching

## Architectural Notes

The foundation should remain relationship-context neutral. Future phases should introduce modules through clear boundaries rather than placing product logic directly inside routes or UI components.

Expected future module boundaries:

- `auth` for identity and sessions
- `profiles` for structured user profile data
- `ai` for profile generation, report generation, and explanation generation
- `compatibility` for deterministic filtering, scoring, and ranking
- `marketplace` for discovery and introduction policies
- `billing` for subscriptions and usage limits
- `notifications` for email and push workflows

## Verification

Run these commands before considering Phase 1 changes complete:

```bash
npm run prisma:generate
npm run lint
npm run typecheck
npm run format:check
npm run build
```
