# Task 05 — GoHighLevel Sync

## Goal
Synchronize portal data into GHL for communications and redundancy.

## Sync Triggers
- Lead created
- Appointment created
- Appointment status updated
- Sales outcome updated

## Direction
Portal → GHL only

## Requirements
- Separate destination for designation review leads
- Retry queue for failed syncs
- No blocking portal operations on GHL failure

## Deliverables
- GHL integration service
- Mapping of portal fields to GHL fields
- Error handling + retries

## Acceptance Criteria
- Leads appear correctly in GHL
- Appointments visible to call center
- Failures logged and recoverable
