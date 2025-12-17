# Task 06 — AI Agent Integration

## Goal
Allow external AI agents to book appointments safely.

## Requirements
- API key creation + scopes
- Rate limiting
- Logging
- No direct DB access

## Required Capabilities
- Read availability
- Hold appointment slot
- Confirm appointment
- Update appointment status

## Notes
- Vendor-agnostic
- Telephony handled externally
- ElevenLabs may provide voice only

## Acceptance Criteria
- Agent can book without UI
- Double booking prevented
- All actions audited
