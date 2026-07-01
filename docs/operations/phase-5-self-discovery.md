# Phase 5 Self-Discovery

## Goal

Implement single-user self-discovery features while keeping AI cost low. The app
generates structured prompt packets, the user runs them in their own ChatGPT, and
the backend validates and saves the JSON report.

## Included

- Personality analysis prompt packet.
- Dating Blueprint prompt packet.
- Relationship strengths prompt packet.
- Blind spots prompt packet.
- Communication style prompt packet.
- Love language prompt packet.
- Attachment style prompt packet.
- Coaching tools prompt packet.
- Structured output schema for saved reports.
- JSON validation before saving.
- Report storage through the existing report service.
- Minimal `/self-discovery` frontend workflow page.

## Routes

- `GET /self-discovery`
- `GET /api/self-discovery/report-types`
- `POST /api/self-discovery/prompt-packet`
- `POST /api/self-discovery/reports`

## Cost-Controlled Flow

1. User selects a report type.
2. Backend returns a prompt packet with instructions and JSON schema.
3. User runs the packet in their own ChatGPT.
4. User pastes the JSON result back into the app.
5. Backend validates the JSON.
6. Backend saves the result as a `Report` with `source: "user_chatgpt"`.

## Not Included

- Backend-paid OpenAI report generation.
- Full report viewing UI.
- Authenticated user session enforcement.
- Compatibility matching.
- Messaging.
- Payments.

## Design Rule

Every report must be saved through the shared report service and validated with
the same structured schema discipline used by the AI infrastructure. Product
features should not store raw unvalidated AI text.
