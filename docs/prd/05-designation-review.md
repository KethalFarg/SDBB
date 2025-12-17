# Designation Review Queue

## Purpose
Catch anything that can't be confidently routed:
- Outside all radii
- ZIP not found in zip_geo
- Multiple practices match (future overlap)
- Practice paused
- Boundary ambiguity

## Admin UX
- Admin sees "Designation Review" as a queue.
- For each lead:
  - show contact info
  - show ZIP
  - show nearest practices + distances (if available)
  - allow "Assign to Practice" + reason + notes
- Assignment moves lead into that practice context.
- Practice users never see that it was manual.

## Audit
Every assignment writes to audit_log with before/after.
