# Local Booking Test Flow

This document outlines a 3-step test flow to verify the public booking endpoints using the seeded test data.

## Configuration

- **Base URL**: `http://localhost:54321/functions/v1/admin-api`
- **Required Header**: `x-sd-website-key: <YOUR_WEBSITE_BOOKING_KEY>`
- **Practice ID**: `11111111-1111-1111-1111-111111111111`
- **Lead ID**: `22222222-2222-2222-2222-222222222222`

---

## Step 1: Check Availability

Verify that the practice has availability for the website to display.

**Request:**
```bash
curl -X GET "http://localhost:54321/functions/v1/admin-api/public/availability?practice_id=11111111-1111-1111-1111-111111111111" \
  -H "x-sd-website-key: YOUR_SECRET_KEY"
```

**Expected Response (200 OK):**
```json
{
  "practice_id": "11111111-1111-1111-1111-111111111111",
  "availability": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "day_of_week": 2,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "type": "available"
    }
  ]
}
```

---

## Step 2: Create Appointment (Success)

Book a slot inside the Tuesday availability (e.g., Tuesday, Dec 23, 2025).

**Request:**
```bash
curl -X POST "http://localhost:54321/functions/v1/admin-api/public/appointments/create" \
  -H "x-sd-website-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "practice_id": "11111111-1111-1111-1111-111111111111",
    "lead_id": "22222222-2222-2222-2222-222222222222",
    "start_at": "2025-12-23T10:00:00Z",
    "end_at": "2025-12-23T10:30:00Z"
  }'
```

**Expected Response (200 OK):**
```json
{
  "appointment": {
    "id": "...",
    "status": "scheduled",
    "source": "website"
  }
}
```

---

## Step 3: Attempt Double-Booking (Conflict)

Attempt to book the exact same slot again to verify overlap prevention.

**Request:**
```bash
curl -X POST "http://localhost:54321/functions/v1/admin-api/public/appointments/create" \
  -H "x-sd-website-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "practice_id": "11111111-1111-1111-1111-111111111111",
    "lead_id": "22222222-2222-2222-2222-222222222222",
    "start_at": "2025-12-23T10:00:00Z",
    "end_at": "2025-12-23T10:30:00Z"
  }'
```

**Expected Response (409 Conflict):**
```json
{
  "error": "time_slot_unavailable",
  "message": "Time slot unavailable"
}
```

---

## Step 4: Outside Availability (Unprocessable Entity)

Attempt to book a slot that is outside the practice's defined availability (e.g., Tuesday, Dec 23, 2025 at 6:00 PM).

**Request:**
```bash
curl -X POST "http://localhost:54321/functions/v1/admin-api/public/appointments/create" \
  -H "x-sd-website-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "practice_id": "11111111-1111-1111-1111-111111111111",
    "lead_id": "22222222-2222-2222-2222-222222222222",
    "start_at": "2025-12-23T18:00:00Z",
    "end_at": "2025-12-23T18:30:00Z"
  }'
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "error": "outside_availability",
  "message": "Time slot outside availability"
}
```

---

## Step 5: Create Appointment HOLD (Success)

**Important:**  
Each step below should use a **fresh, unused time slot**.  
If you reuse a slot that already has a `scheduled` appointment, the system will correctly return `time_slot_unavailable`.

Create a temporary hold for a slot inside the Tuesday availability. This prevents other bookings during checkout / agent flow.

### Create payload file
```powershell
Set-Content -Path .\payload-hold.json -Value '{
  "practice_id": "11111111-1111-1111-1111-111111111111",
  "lead_id": "22222222-2222-2222-2222-222222222222",
  "start_at": "2025-12-23T11:00:00Z",
  "end_at": "2025-12-23T11:30:00Z",
  "hold_minutes": 10
}'
```

**Request:**
```powershell
curl.exe -X POST "http://localhost:54321/functions/v1/admin-api/public/appointments/hold" `
  -H "x-sd-website-key: YOUR_SECRET_KEY" `
  -H "Content-Type: application/json" `
  --data-binary "@payload-hold.json"
```

**Expected Response (200 OK):**
```json
{
  "hold": {
    "id": "33333333-...",
    "status": "hold",
    "expires_at": "2025-12-23T..."
  }
}
```

---

## Step 6: Confirm Appointment HOLD (Success)

Finalize a held appointment. This transitions the status from `hold` to `scheduled`.

**Request:**
```powershell
curl.exe -X POST "http://localhost:54321/functions/v1/admin-api/public/appointments/confirm" `
  -H "x-sd-website-key: YOUR_SECRET_KEY" `
  -H "Content-Type: application/json" `
  -d '{"appointment_id": "HOLD_ID_FROM_STEP_5"}'
```

**Expected Response (200 OK):**
```json
{
  "appointment": {
    "id": "33333333-...",
    "status": "scheduled",
    "expires_at": null
  }
}
```

---

## Step 9: ZIP → Slots (Success)

Verify ZIP-based routing and slot generation for a given date.

This endpoint:
- Resolves the best practice for the ZIP code (within radius)
- Builds slots from `availability_blocks` where `type = 'available'`
- Excludes slots that overlap scheduled appointments
- Excludes slots that overlap ACTIVE holds (`status='hold'` and `expires_at > now()`)
- Ignores expired holds

### Request (200 OK)
```powershell
curl.exe -X GET "http://localhost:54321/functions/v1/admin-api/public/slots?zip=33139&date=2025-12-23&slot_minutes=30" `
  -H "x-sd-website-key: YOUR_SECRET_KEY"
```

**Expected Response (200 OK):**
```json
{
  "zip": "33139",
  "date": "2025-12-23",
  "slot_minutes": 30,
  "slots": [
    {
      "slot_start": "2025-12-23T09:00:00+00:00",
      "slot_end": "2025-12-23T09:30:00+00:00"
    },
    ...
  ]
}
```

