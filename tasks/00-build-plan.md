# Build Plan (execute in order)

## Phase 0: Foundation
1) Create Supabase project
2) Implement schema/migrations for core tables
3) Implement RLS policies for practice isolation
4) Implement Routing Engine endpoints
5) Implement Designation Review endpoints

## Phase 1: Booking platform
6) Implement availability CRUD
7) Implement appointment hold/confirm
8) Implement appointment status + sales outcome rules
9) Implement audit logging

## Phase 1: Portals
10) Client portal screens (read-only first)
11) Admin console screens (Practices + Designation + Impersonate)
12) Admin map view with circles (see 03-admin-map.md)

## Phase 1: Integrations
13) GHL sync job + retry queue
14) Webhooks/event emitter (lead.created, appointment.created)

## Deliverables
- Supabase migrations (SQL)
- API contracts (OpenAPI or typed TS)
- Working portal UIs
