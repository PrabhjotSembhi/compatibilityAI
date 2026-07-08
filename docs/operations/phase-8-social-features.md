# Phase 8 - Social Features

## Goal

Phase 8 adds social primitives after matching: messaging, likes, notifications, match history, conversation starters, and safety tools.

## Backend Boundary

The social layer lives under `src/server/social` and exposes API routes under `src/app/api/social`.

Included:

- `SocialLike` model for likes and withdrawn likes
- `SafetyReport` model for user, match, and conversation safety reports
- message send/list workflows on top of existing `Conversation` and `ConversationMessage`
- notification creation for likes, mutual likes, messages, and safety reports
- match history listing with related likes and safety reports
- deterministic conversation starters

Not included:

- realtime websocket delivery
- read receipts
- typing indicators
- attachment uploads
- moderation review dashboard
- blocking enforcement in matching
- full frontend inbox UI

## API

`GET /api/social/likes`

Lists likes by `userId`, `relationshipContextId`, `status`, and `take`.

`POST /api/social/likes`

Creates or reactivates a like and returns whether it is mutual.

`PATCH /api/social/likes`

Withdraws an active like.

`GET /api/social/messages`

Lists conversations and messages visible to a user.

`POST /api/social/messages`

Creates a conversation if needed, saves a message, and creates an in-app notification for the recipient.

`GET /api/social/notifications`

Lists in-app notifications.

`GET /api/social/match-history`

Lists historical matches with related social likes and safety reports.

`POST /api/social/conversation-starters`

Returns deterministic conversation starter prompts.

`GET /api/social/safety`

Lists safety reports.

`POST /api/social/safety`

Creates a safety report.

## Notes

Messaging is intentionally stored as domain data first. Realtime fanout can be added later behind the same service boundary.
