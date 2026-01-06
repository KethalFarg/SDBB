# Task 02 — API Contracts & Endpoints

## Goal
Define and implement the API endpoints that power routing, booking, portals, and agents.

## Required Endpoints

### Routing
- POST /routing/resolve

### Leads
- POST /leads
- GET /leads?practice_id=
- GET /leads/:id

### Assessments
- POST /assessments
- GET /assessments/:id

### Availability
- GET /availability
- POST /availability_blocks
- DELETE /availability_blocks/:id

### Booking
- POST /appointments/hold
- POST /appointments/confirm
- PATCH /appointments/:id

### Designation Review (Admin only)
- GET /designation_review
- POST /designation_review/:id/assign

### Admin
- GET /admin/practices
- POST /admin/practices
- PATCH /admin/practices/:id
- POST /admin/impersonate

## Requirements
- All POST endpoints must support Idempotency-Key
- Authentication via JWT or API key
- Agent keys scoped by permission
- Audit logging for all state-changing endpoints

## Deliverables
- OpenAPI or typed API definitions
- Endpoint stubs implemented
- Error handling per PRD rules

## Acceptance Criteria
- API matches PRD exactly
- Unauthorized access is rejected
- Idempotency prevents double booking
