// -------------------------------------------------------------------------
// Core Entity Types (Mirroring Database Schema)
// -------------------------------------------------------------------------

export type PracticeStatus = 'active' | 'paused';
export type RoutingOutcome = 'assigned' | 'designation';
export type LeadSource = 'website' | 'quiz' | 'ads' | 'manual' | 'other';
export type AppointmentStatus = 'scheduled' | 'show' | 'no_show' | 'pending' | 'canceled';
export type SalesOutcome = 'won' | 'lost' | 'pending';
export type AppointmentSource = 'call_center' | 'website' | 'ai_agent';

export interface Practice {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  radius_miles: number;
  status: PracticeStatus;
  profile_payload: Record<string, any>;
  booking_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  practice_id: string | null;
  routing_outcome: RoutingOutcome;
  designation_reason: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  source: LeadSource;
  routing_snapshot: Record<string, any>;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  practice_id: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  status: AppointmentStatus;
  sales_outcome: SalesOutcome;
  objection: string | null;
  source: AppointmentSource;
  created_by: string | null;
  created_at: string;
}

// -------------------------------------------------------------------------
// API Request/Response Contracts
// -------------------------------------------------------------------------

// --- Routing ---

export interface ResolveRoutingRequest {
  zip: string;
  context: 'website' | 'quiz' | 'portal' | 'api';
}

export interface ResolveRoutingResponse {
  outcome: RoutingOutcome;
  practice_id: string | null;
  practice_details?: {
    name: string;
    address: string;
    distance_miles: number;
  };
  reason?: string; // e.g., 'zip_not_found', 'no_provider_in_radius'
  routing_snapshot_id?: string;
}

// --- Leads ---

export interface CreateLeadRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  source: LeadSource;
  // Optional: if lead came from an assessment
  responses?: Record<string, any>; 
}

export interface CreateLeadResponse extends Lead {
  // Returns the full lead object
}

export interface GetLeadsRequest {
  practice_id?: string;
  limit?: number;
  offset?: number;
}

export interface GetLeadsResponse {
  data: Lead[];
  total: number;
}

// --- Assessments ---

export interface CreateAssessmentRequest {
  lead_id: string;
  responses: Record<string, any>;
  report_payload?: Record<string, any>;
}

export interface AssessmentResponse {
  id: string;
  lead_id: string;
  practice_id: string;
  responses: Record<string, any>;
  report_payload: Record<string, any>;
  created_at: string;
}

// --- Availability ---

export interface AvailabilitySlot {
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  available: boolean;
}

export interface GetAvailabilityResponse {
  practice_id: string;
  date: string; // YYYY-MM-DD
  slots: AvailabilitySlot[];
}

export interface CreateAvailabilityBlockRequest {
  practice_id: string;
  day_of_week: number; // 0-6
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  type?: string;
}

// --- Booking ---

export interface HoldAppointmentRequest {
  lead_id: string;
  practice_id: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  source: AppointmentSource;
}

export interface HoldAppointmentResponse {
  hold_id: string;
  expires_at: string; // ISO 8601
  status: 'held';
}

export interface ConfirmAppointmentRequest {
  hold_id: string;
  lead_id: string; // verification
}

export interface ConfirmAppointmentResponse extends Appointment {
  status: 'scheduled';
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  sales_outcome?: SalesOutcome;
  objection?: string;
}

// --- Designation Review (Admin) ---

export interface DesignationItem {
  id: string;
  lead: Lead;
  reason_code: string;
  notes: string | null;
  created_at: string;
  nearby_practices?: {
    id: string;
    name: string;
    distance_miles: number;
  }[];
}

export interface AssignDesignationRequest {
  assigned_practice_id: string;
  notes?: string;
}

// --- Admin ---

export interface AdminPracticeRequest {
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius_miles: number;
  status: PracticeStatus;
  profile_payload?: Record<string, any>;
  booking_settings?: Record<string, any>;
}

export interface AdminImpersonateRequest {
  practice_id: string;
  user_id: string;
}

export interface AdminImpersonateResponse {
  token: string;
  expires_in: number;
}
