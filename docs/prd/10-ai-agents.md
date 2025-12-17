# AI Calling / Booking Agents (Phase 1 test-ready)

## Goal
Allow external agent systems to book appointments without portal UI:
- Read availability
- Hold slot
- Confirm appointment

## Security
- API Keys with scopes
- Rate limiting per key
- Full logging

## Required endpoints
- GET availability
- POST hold
- POST confirm
- PATCH appointment status

## Vendor-agnostic
ElevenLabs may do voice.
Telephony/calling handled by separate provider/platform.
System must not depend on vendor-specific payloads.
