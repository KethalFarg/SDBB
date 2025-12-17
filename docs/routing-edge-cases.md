# Routing Logic Edge Cases

The `routing-resolve` function handles the following edge cases:

## 1. ZIP Not Found
- **Condition**: User enters a ZIP code that does not exist in the `zip_geo` table.
- **Outcome**: `designation`
- **Reason**: `zip_not_found`
- **Action**: No distance calculation is attempted.

## 2. No Active Practices
- **Condition**: There are no practices with `status = 'active'` in the system.
- **Outcome**: `designation`
- **Reason**: `no_provider_in_radius` (technically)

## 3. No Practice in Radius
- **Condition**: ZIP is found, but all active practices are further away than their configured `radius_miles`.
- **Outcome**: `designation`
- **Reason**: `no_provider_in_radius`

## 4. Multiple Practices in Radius
- **Condition**: ZIP is within the `radius_miles` of 2 or more active practices.
- **Outcome**: `designation` (Review required to choose best fit)
- **Reason**: `multiple_providers_match`

## 5. Exact Single Match
- **Condition**: Exactly one practice covers the ZIP code.
- **Outcome**: `assigned`
- **Result**: Returns `practice_id` and details for immediate booking/display.

## 6. Missing Coordinates
- **Condition**: A practice record is missing `lat` or `lng`.
- **Action**: The practice is skipped during distance calculation to prevent errors.

