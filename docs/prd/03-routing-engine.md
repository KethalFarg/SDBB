# Routing Engine (Radius-based via ZIP input)

## User Experience
Users enter a ZIP code.
System uses ZIP -> lat/lng to route to one practice if inside exactly one radius.

## ZIP to Geo
- Use zip_geo table for ZIP centroid coordinates
- If ZIP not found => Designation Review

## Endpoint: POST /routing/resolve
Input:
- zip: string
- context: 'website'|'quiz'|'portal'|'api'

Algorithm:
1) Lookup zip_geo for zip
2) If missing => outcome 'designation' reason 'zip_not_found'
3) Query active practices
4) For each practice compute distance_miles(zip_latlng, practice_latlng)
5) Matches = practices where distance <= practice.radius_miles
6) If matches.length == 1 => assigned
7) Else => designation
   - reason = 'no_provider_in_radius' OR 'multiple_providers_match'
8) Persist routing_snapshot on lead creation OR return snapshot id (if just resolving)
9) Return:
- outcome
- practice_id (nullable)
- practice_profile (if assigned)

## Distance Calculation
MVP can use Haversine in SQL or API layer.
Future optimization: PostGIS geography + ST_DWithin.
