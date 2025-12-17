# SpinalDecompression.com Platform PRD (MVP + Phase 1.5)

## Goal
Build a single backend platform ("Routing & Booking Brain") that powers:
- Website ZIP routing
- Custom quiz report routing/personalization
- Client portal (practice view)
- Admin console (ops view)
- Designation Review queue for edge cases
- Availability + booking (portal as source of truth)
- Sync to GoHighLevel (GHL) for communications/backup
- Phase 1 tests for AI calling/booking agents

## Non-Negotiable Principle
Routing and booking logic must exist in exactly one place:
- Routing Engine API + Database (Supabase/Postgres)

No duplicated routing logic in:
- Website code
- Quiz code
- GHL workflows
- Portal UI

## MVP Scope
- Radius-based routing using ZIP input (ZIP -> lat/lng -> distance to clinic)
- Practice + Admin portals
- Leads, Assessments, Appointments
- Availability blocks for booking
- Designation Review queue
- Admin "View as Practice" (impersonation)
- Audit logging
- GHL sync for lead + appointment visibility

## Phase 1.5 Scope
- Website self-booking UI (reuses same booking endpoints)
- Credit card hold (inserted between hold/confirm)
- Expanded automations

## Phase 1 Experiment Scope (AI)
- External AI agent can:
  - Read availability
  - Hold a slot
  - Confirm appointment
  - Update status
- Vendor-agnostic: ElevenLabs may provide voice, telephony handled by external provider/platform.
