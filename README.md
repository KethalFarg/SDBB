# System README

## API & Edge Functions

The system uses Supabase Edge Functions. The definitions are strictly typed.

### Source of Truth
- **Contract Definition**: `src/types/api.ts` is the canonical source of truth for all API request/response objects.
- **Deno Shared Types**: `supabase/functions/_shared/api-types.ts` is a derived copy of `src/types/api.ts`. Any changes to the contract must be made in `src/types/api.ts` first and then copied to `_shared`.

### Routing Strategy

We use a domain-based function strategy where related endpoints are grouped into a single Edge Function to minimize cold starts and group logic.

| Function Name | Base Path (Stub) | Responsibilities | Internal Routes |
| :--- | :--- | :--- | :--- |
| `routing-resolve` | `/routing` | Routing Logic | `POST /routing/resolve` |
| `leads-api` | `/leads` | Lead Management | `POST /leads`<br>`GET /leads`<br>`POST /assessments` |
| `booking-api` | `/booking` | Availability & Appts | `GET /practices/:id/availability`<br>`POST /availability_blocks`<br>`DELETE /availability_blocks/:id`<br>`POST /appointments/hold`<br>`POST /appointments/confirm`<br>`PATCH /appointments/:id` |
| `admin-api` | `/admin` | Admin Operations | `GET /admin/practices`<br>`POST /admin/practices`<br>`PATCH /admin/practices/:id`<br>`POST /admin/impersonate`<br>`GET /designation_review`<br>`POST /designation_review/:id/assign` |

**Note**: The internal routers in each function use `path.endsWith(...)` or regex matching to handle the specific sub-paths.

