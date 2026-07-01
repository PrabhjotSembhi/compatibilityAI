# Product Vision

## Purpose

Compatibility AI helps people understand, discover, and evaluate high-quality human matches across different relationship contexts. The product should begin as a single-player AI assistant that helps one user understand themselves and what they are looking for, then evolve into a multi-sided marketplace where compatible people can be discovered, ranked, introduced, and supported over time.

## Long-Term Product Shape

The product should not be treated as a dating app with extra categories. Instead, it should be a compatibility platform with configurable relationship contexts.

Possible relationship contexts include:

- Romantic compatibility
- Friendship
- Co-founder matching
- Professional networking
- Mentorship
- Community or group matching
- Event-based introductions

Each context may use different eligibility rules, profile fields, privacy defaults, scoring weights, consent models, and success metrics, while sharing the same underlying compatibility engine.

## Product Principles

- Start with self-understanding before marketplace discovery.
- Treat AI as a profile and insight layer, not as the source of ranking truth.
- Prefer deterministic, inspectable backend matching over opaque AI ranking.
- Make user consent and privacy boundaries explicit.
- Design for multiple relationship types from the beginning.
- Preserve explainability: users and operators should understand why a match appears.
- Avoid irreversible early assumptions about monetization, marketplace liquidity, or social graph design.

## AI Role

AI should help turn messy human input into structured, useful, updateable profile data. Examples:

- Extracting preferences, values, constraints, interests, goals, and communication style.
- Asking follow-up questions to reduce ambiguity.
- Summarizing a user's profile in human-friendly language.
- Updating structured fields as the user changes over time.
- Generating explanations from backend match outputs.

AI should not be the primary authority for filtering, scoring, ranking, access control, or marketplace fairness.

## Backend Role

The backend should be responsible for deterministic decisions:

- Eligibility filtering
- Hard constraint enforcement
- Compatibility scoring
- Ranking
- Privacy enforcement
- Consent checks
- Audit logs
- Marketplace exposure rules
- Experiment configuration

This division keeps the product cheaper to operate, easier to debug, safer to test, and less dependent on model behavior.
