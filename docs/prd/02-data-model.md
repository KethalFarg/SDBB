# Data Model (Supabase / Postgres)

## Tables (Core)
### practices
- id uuid pk
- name text
- address text
- lat double precision
- lng double precision
- radius_miles numeric
- status text enum('active','paused')
- profile_payload jsonb (doctor name, photos, bio, clinic media, etc.)
- booking_settings jsonb
- created_at timestamptz
- updated_at timestamptz

### zip_geo
- zip text pk (e.g., '40202')
- lat double precision
- lng double precision
- source text (optional)
- updated_at timestamptz

### routing_rules
- id uuid pk
- practice_id uuid fk practices(id)
- radius_miles numeric
- exclusivity boolean default true
- priority int default 1 (MVP locked)
- status text enum('active','paused')
- effective_from timestamptz
- effective_to timestamptz null
- created_by uuid (admin user id)
- created_at timestamptz

### leads
- id uuid pk
- practice_id uuid null fk practices(id)
- routing_outcome text enum('assigned','designation')
- designation_reason text null
- first_name text
- last_name text
- email text
- phone text
- zip text
- source text enum('website','quiz','ads','manual','other')
- routing_snapshot jsonb
- created_at timestamptz

### assessments
- id uuid pk
- lead_id uuid fk leads(id)
- practice_id uuid fk practices(id)
- responses jsonb
- report_payload jsonb
- created_at timestamptz

### availability_blocks
- id uuid pk
- practice_id uuid fk practices(id)
- day_of_week int (0-6)
- start_time time
- end_time time
- type text default 'new_patient'
- created_at timestamptz

### appointments
- id uuid pk
- lead_id uuid fk leads(id)
- practice_id uuid fk practices(id)
- start_time timestamptz
- end_time timestamptz
- status text enum('scheduled','show','no_show','pending','canceled')
- sales_outcome text enum('won','lost','pending')
- objection text null
- source text enum('call_center','website','ai_agent')
- created_by text (user_id or agent_key_id)
- created_at timestamptz

### designation_review
- id uuid pk
- lead_id uuid fk leads(id)
- reason_code text
- notes text
- assigned_practice_id uuid null fk practices(id)
- resolved_by uuid null
- resolved_at timestamptz null
- created_at timestamptz

### audit_log
- id uuid pk
- entity_type text
- entity_id uuid
- action text
- performed_by text (admin user id / agent key)
- metadata jsonb
- created_at timestamptz

## Indexes
- leads(zip)
- leads(practice_id, created_at)
- appointments(practice_id, start_time)
- zip_geo(zip)
- practices(status)
