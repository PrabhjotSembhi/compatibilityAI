# Domain Model

## Core Concepts

## User

A person using the product. A user may participate in multiple relationship contexts with different visibility, goals, and preferences.

## Relationship Context

A configurable matching domain such as dating, friendship, co-founder matching, or networking.

A relationship context defines:

- Required profile attributes
- Optional profile attributes
- Hard constraints
- Scoring dimensions
- Ranking weights
- Visibility rules
- Consent rules
- Success metrics

## Structured Profile

A normalized representation of a user's traits, values, goals, interests, preferences, constraints, and interaction style.

The profile should be versioned because people change and AI extraction can improve over time.

## Profile Attribute

A single structured field or dimension in a profile. Attributes should include source metadata where possible:

- Value
- Confidence
- Source
- Timestamp
- Relationship context applicability
- Sensitivity level

## Preference

A user's desired qualities or constraints for a match. Preferences may be hard requirements, soft preferences, or context-specific ranking inputs.

## Constraint

A rule that must be satisfied before scoring. Constraints should be deterministic and auditable.

## Candidate

A user who may be evaluated for compatibility in a specific relationship context.

## Match Evaluation

A deterministic result produced by the compatibility engine. It should include filtering decisions, scores, rank inputs, and explanation data.

## Introduction

A marketplace event where one or more users are shown to each other or invited into a connection flow. Introduction policy may vary significantly by relationship context.
