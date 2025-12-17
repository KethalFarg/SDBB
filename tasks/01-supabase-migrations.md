# Task 01 — Supabase Schema & RLS

## Goal
Create the Supabase database schema exactly as defined in `/docs/prd/02-data-model.md`.

## Deliverables
- SQL migration files for:
  - practices
  - zip_geo
  - routing_rules
  - leads
  - assessments
  - availability_blocks
  - appointments
  - designation_review
  - audit_log
- Indexes as specified
- Enum types where defined
- Foreign keys enforced

## RLS Requirements
- Practice users can only see rows where practice_id matches their auth context
- Admin role can access all rows (server-side via service role)
- Agents cannot bypass RLS
- Leads in designation_review visible only to admin

## Notes
- Do NOT assume PostGIS initially
- Distance calculation can be done in API layer
- Create placeholders for future PostGIS migration

## Acceptance Criteria
- Schema matches PRD
- RLS prevents cross-practice access
- Admin access works via service role
