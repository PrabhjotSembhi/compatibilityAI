# System Overview

## Conceptual Layers

1. User Interaction Layer
   - Collects user input through chat, forms, onboarding, feedback, and future marketplace interactions.

2. AI Profile Layer
   - Converts natural language and behavioral signals into structured profile data.
   - Produces confidence scores and asks follow-up questions when data is weak.

3. Profile Store
   - Stores normalized profile attributes, preferences, constraints, relationship goals, and profile versions.

4. Policy Layer
   - Enforces privacy, consent, eligibility, visibility, and relationship-context-specific rules.

5. Compatibility Engine
   - Filters candidates, scores compatibility, ranks results, and produces structured explanations.

6. Marketplace Layer
   - Handles discovery surfaces, exposure limits, introduction flows, supply-demand balancing, and feedback loops.

7. Analytics and Evaluation Layer
   - Tracks profile completeness, match quality, marketplace health, fairness, latency, cost, and retention.

## Suggested Service Boundaries

These are conceptual boundaries, not immediate microservices.

- Profile Intelligence Service
- User Profile Service
- Compatibility Engine Service
- Policy and Consent Service
- Marketplace Discovery Service
- Explanation Service
- Evaluation Service

The early codebase can live as a modular monolith while preserving these boundaries through clear interfaces.
