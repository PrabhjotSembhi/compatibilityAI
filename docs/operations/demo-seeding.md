# Demo Seeding

Use `npm run seed:demo` to load local fake compatibility profiles for testing the backend test console.

The seed script is guarded:

- It refuses to run unless `DATABASE_URL` points to `localhost`, `127.0.0.1`, or `::1`.
- It reads the fixture from `C:\Users\Ryzen\Desktop\fake_compatibility_profiles_50.json` by default.
- The fixture file is not committed.
- Do not set `ALLOW_REMOTE_DEMO_SEED=true` unless the target database is disposable.

Run:

```bash
npm run seed:demo
```

Use the printed `relationshipContextId` in the test console. Good starter IDs from the fixture are:

- `user_001`
- `user_002`
- `user_003`

The seed creates:

- one active `RelationshipContext` with slug `demo-dating`
- demo `User` records
- active discoverable `Profile` records
- `PersonalityProfile` records
- `CompatibilityProfile` records with embeddings
