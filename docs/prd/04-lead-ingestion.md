# Lead Ingestion

## Sources
- Website form
- Quiz completion
- Third-party lead forms (FB/TikTok/etc.)
- Manual admin entry

## Rules
- A "Lead" is created on any contact capture.
- An "Assessment" may create a Lead if lead doesn't exist.
- A "Report" button is shown only if assessment exists.

## Lead creation flow
1) Receive lead payload (contact + zip + source)
2) Call routing engine
3) If assigned => store practice_id and routing_snapshot
4) If designation => store routing_outcome='designation' + create designation_review row
5) Emit webhook/event: lead.created
6) Sync lead to GHL downstream (see integrations)
