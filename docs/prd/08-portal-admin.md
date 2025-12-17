# Admin Console

## Must-have sections
- Practices
  - create/edit practice details
  - set address (geocode to lat/lng)
  - set radius miles
  - status active/paused
- Map View (see /tasks/03-admin-map.md)
- Designation Review
- Performance Dashboard (aggregated)
- Impersonation (View as Practice)

## Practice setup workflow (onboarding)
1) Create practice
2) Set address and lat/lng
3) Set radius
4) Validate coverage (map + ZIP tests)
5) Activate practice
6) Configure GHL routing destination

## Routing exclusivity enforcement (MVP)
Even though system supports overlap, UI should prevent overlap by default:
- Warn admin if overlap is detected
- Allow override only with admin confirmation (can be deferred)
