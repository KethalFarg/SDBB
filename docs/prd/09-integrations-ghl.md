# GoHighLevel (GHL) Integration

## Principle
GHL is downstream visibility + communications.
Routing + booking source of truth remains portal.

## Sync to GHL
- When lead created:
  - create/update contact
  - add to pipeline/stage based on practice assignment
  - if designation: route to special designation pipeline/subaccount
- When appointment created:
  - push appointment details into GHL (calendar or notes + custom fields)
- When status/outcome updated:
  - update GHL custom fields/pipeline stages

## Failure mode
If GHL sync fails:
- Portal remains correct
- Retry queue stores failed sync jobs
