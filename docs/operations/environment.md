# Environment Variables

Secrets must not be committed. Keep `.env.example` as the template and `.env` as local-only configuration.

## Required For Local Development

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `DIRECT_URL`: Direct or session-mode PostgreSQL connection string for migrations when the runtime URL uses a pooler.
- `BETTER_AUTH_SECRET`: Long random secret for Better Auth.
- `BETTER_AUTH_URL`: Application URL used by Better Auth.
- `NEXT_PUBLIC_APP_URL`: Public application URL used by browser-facing code.

## Optional Providers

- `OPENAI_API_KEY`: AI provider access. Phase 2 only defines the service boundary; Phase 4 owns prompts and structured output flows.
- `OPENAI_MODEL`: Default OpenAI model used by the AI infrastructure when a prompt version does not specify a model.
- `AI_RATE_LIMIT_REQUESTS`: Request limit per rate-limit window.
- `AI_RATE_LIMIT_WINDOW_MS`: Rate-limit window in milliseconds.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL if Supabase client features are needed later.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable anon key if browser-side Supabase access is needed later.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only Supabase service key. Never expose it to the browser.
- `POSTHOG_KEY`: Product analytics.
- `SENTRY_DSN`: Error monitoring.

Do not add product-specific AI prompts until the relevant feature phase starts.
