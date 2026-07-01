# Architecture Principles

## Primary Goal

Design a modular compatibility platform that can support multiple relationship types without rebuilding core matching logic for each use case.

## Principles

1. Separate AI interpretation from deterministic matching.
2. Keep domain models extensible and relationship-type neutral.
3. Represent user profiles as structured data with version history.
4. Make scoring explainable and testable.
5. Keep privacy and consent checks close to data access and matching workflows.
6. Prefer configuration and policy objects over hard-coded product assumptions.
7. Optimize for low operational cost before adding complex infrastructure.
8. Avoid premature marketplace mechanics until the single-player assistant proves profile quality.

## Non-Goals For Now

- No dating-specific feature implementation.
- No UI implementation.
- No recommendation model training.
- No social graph implementation.
- No real-time messaging assumptions.
- No monetization-specific architecture.

## Design Biases

- Modular monolith first, service boundaries later.
- Deterministic jobs and APIs before AI-driven orchestration.
- Relational storage for core user, profile, and match records.
- Event history for profile changes and match decisions.
- Clear interfaces around profile generation, scoring, ranking, and policy enforcement.
