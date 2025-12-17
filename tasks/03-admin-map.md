# Admin Map View (Google Maps-style) — Requirements

## Goal
Admin can see all clinics on an interactive map with:
- a pin marker per clinic
- a circle representing the radius (miles)
- edit radius via input and see circle update live
- detect overlaps (visual + warning)

## UX Requirements
- Map loads with all active practices
- Clicking a practice opens a side panel:
  - practice name
  - address
  - radius input (miles)
  - status toggle active/paused
  - save button
- Circle updates instantly as radius changes (preview)
- On save, persist to DB + audit log

## Map Tech
Choose one:
- Mapbox GL JS (recommended)
- Google Maps JS API
- Leaflet + OpenStreetMap tiles

## Notes
Google-like UX is achievable. Not too difficult.
Main work is UI + geospatial circle rendering.

## Data requirements
- practices must have lat/lng
- radius_miles must be stored
