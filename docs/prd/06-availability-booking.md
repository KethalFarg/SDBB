# Availability & Booking (Portal source of truth)

## Availability
Practice defines weekly availability blocks.
- day_of_week + time range
- new patient consult type

## Booking API (multi-client)
Consumers:
- Portal booking UI (call center users)
- Website booking widget (Phase 1.5)
- AI agent (Phase 1 tests)

## Holds + Confirm (required)
To prevent double booking (especially for AI + web retries):
- POST /appointments/hold
- POST /appointments/confirm

Hold rules:
- Hold expires after 5-10 minutes
- Slot cannot be held twice concurrently

Confirm rules:
- Must reference hold_id or same idempotency key
- Creates appointment

Idempotency:
- POST endpoints must support Idempotency-Key

## Appointment statuses
- scheduled
- show
- no_show
- pending
- canceled

Sales outcomes
- won
- lost (objection required)
- pending
