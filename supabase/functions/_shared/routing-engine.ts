import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Practice, RoutingOutcome } from "./api-types.ts"

// Haversine formula to calculate distance in miles
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RoutingResult {
  outcome: RoutingOutcome;
  practice_id: string | null;
  practice_details?: {
    name: string;
    address: string;
    distance_miles: number;
  };
  reason?: string;
  routing_snapshot: any;
}

export async function resolveRouting(
  supabase: SupabaseClient, 
  zip: string
): Promise<RoutingResult> {
  const bufferMiles = Number(Deno.env.get('ROUTING_RADIUS_BUFFER_MILES') ?? '1') || 1;
  const nearMissMiles = Number(Deno.env.get('ROUTING_NEAR_MISS_MILES') ?? '2') || 2;

  // 1. Lookup ZIP in zip_geo
  const { data: zipData, error: zipError } = await supabase
    .from('zip_geo')
    .select('lat, lng')
    .eq('zip', zip)
    .single();

  if (zipError || !zipData) {
    return {
      outcome: 'designation',
      practice_id: null,
      reason: 'zip_not_found',
      routing_snapshot: { zip, error: 'zip_not_found', reason_code: 'zip_not_found' }
    };
  }

  const { lat: zipLat, lng: zipLng } = zipData;

  // 2. Fetch all active practices
  const { data: practices, error: practiceError } = await supabase
    .from('practices')
    .select('*')
    .eq('status', 'active');

  if (practiceError) throw practiceError;

  // 3. Calculate distances and filter
  const matches: { practice: Practice; distance: number; effective_radius: number }[] = [];
  const nearMisses: { practice: Practice; distance: number; threshold: number }[] = [];
  const evaluatedPractices: any[] = []; // For snapshot

  for (const p of (practices as Practice[])) {
    if (p.lat == null || p.lng == null) continue;
    
    const distance = calculateDistance(zipLat, zipLng, p.lat, p.lng);
    const effectiveRadius = (p.radius_miles ?? 0) + bufferMiles;
    const nearMissThreshold = effectiveRadius + nearMissMiles;
    
    // Add to evaluated list (limited)
    evaluatedPractices.push({
      id: p.id,
      name: p.name,
      distance: parseFloat(distance.toFixed(2)),
      in_radius: distance <= effectiveRadius,
      effective_radius: effectiveRadius,
      near_miss_threshold: nearMissThreshold
    });

    if (distance <= effectiveRadius) {
      matches.push({ practice: p, distance, effective_radius: effectiveRadius });
    } else if (distance <= nearMissThreshold) {
      nearMisses.push({ practice: p, distance, threshold: nearMissThreshold });
    }
  }

  // Sort matches by distance
  matches.sort((a, b) => a.distance - b.distance);
  nearMisses.sort((a, b) => a.distance - b.distance);

  // 4. Determine Outcome
  let outcome: RoutingOutcome = 'designation';
  let reason: string | undefined;
  let assignedPractice: { practice: Practice; distance: number } | null = null;

  if (matches.length === 0) {
    if (nearMisses.length > 0) {
      outcome = 'designation';
      reason = 'near_miss';
    } else {
      outcome = 'designation';
      reason = 'no_provider_in_radius';
    }
  } else if (matches.length === 1) {
    outcome = 'assigned';
    reason = 'in_radius';
    assignedPractice = matches[0];
  } else {
    // > 1 match
    outcome = 'designation';
    reason = 'multiple_providers_match';
  }

  const routing_snapshot = {
    zip,
    zip_geo: { lat: zipLat, lng: zipLng },
    outcome,
    reason,
    reason_code: reason,
    buffer_miles: bufferMiles,
    near_miss_miles: nearMissMiles,
    matches: matches.map(m => ({ id: m.practice.id, name: m.practice.name, distance: m.distance, effective_radius: m.effective_radius })),
    near_misses: nearMisses.map(n => ({ id: n.practice.id, name: n.practice.name, distance: n.distance, threshold: n.threshold })),
    evaluated: evaluatedPractices.sort((a,b) => a.distance - b.distance).slice(0, 5) // Top 5 nearest
  };

  return {
    outcome,
    practice_id: assignedPractice ? assignedPractice.practice.id : null,
    practice_details: assignedPractice ? {
      name: assignedPractice.practice.name,
      address: assignedPractice.practice.address || '',
      distance_miles: parseFloat(assignedPractice.distance.toFixed(2))
    } : undefined,
    reason,
    routing_snapshot
  };
}

