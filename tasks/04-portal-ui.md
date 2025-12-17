# Task 04 — Portal UI (Client + Admin)

## Goal
Implement the portal UI based on `/docs/prd/07-portal-client.md` and `/docs/prd/08-portal-admin.md`.

## Client Portal
- Dashboard (basic metrics)
- Patients:
  - Leads list
  - Assessments list (with Report button)
  - Appointments list
- Availability editor
- Sales outcome editor
- Settings (practice, users, notifications, booking)
- Help & Support placeholder

## Admin Portal
- Practice list + editor
- Designation Review queue
- Impersonation (View as Practice)
- Performance overview
- Map view (see Task 03)

## Requirements
- Respect role-based access
- No routing visibility for practices
- Conditional UI elements per PRD
- Impersonation clearly indicated in UI

## Acceptance Criteria
- Practice users see only their data
- Admin sees all practices
- Impersonation works and is logged
