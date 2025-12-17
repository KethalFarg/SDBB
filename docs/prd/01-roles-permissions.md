# Roles & Permissions

## Roles
### Admin
- Full access to all practices, leads, assessments, appointments
- Can configure routing rules and practice details
- Can resolve Designation Review leads
- Can impersonate practice users (View as Practice)
- Can view audit logs

### Practice User
- Access ONLY to their practice data:
  - leads, assessments, appointments, availability, settings, help/support
- No visibility into routing rules, other practices, designation queue

### Agent Key (API Key role)
- Non-human actor (AI agent / website widget / integration)
- Scoped permissions:
  - read availability
  - create hold
  - confirm appointment
  - (optional) limited lead access
- Cannot access admin endpoints

## Impersonation
- Admin can obtain a temporary "practice session" token to view portal exactly as that practice.
- All impersonation sessions must be logged (admin_id, practice_id, start/end).

## RLS Expectations (Supabase)
- Practice users must be protected by RLS based on practice_id.
- Admin bypass via service role on server-side only.
