const ENABLE_GHL_SYNC = (Deno.env.get('ENABLE_GHL_SYNC') ?? 'false').toLowerCase() === 'true';

type LeadLike = {
  id: string;
  practice_id: string | null;
  routing_outcome?: string | null;
  designation_reason?: string | null;
};

export async function maybeSyncLeadToGHL(lead: LeadLike, context: string) {
  if (!ENABLE_GHL_SYNC) {
    console.log(
      'GHL_SYNC_DISABLED — would sync lead',
      lead?.id,
      'for practice',
      lead?.practice_id,
      'context',
      context
    );
    return;
  }

  // TODO: Implement real GHL sync here when ENABLE_GHL_SYNC is true.
  console.log('GHL_SYNC_ENABLED (stub) — TODO implement real sync', {
    lead_id: lead?.id,
    practice_id: lead?.practice_id,
    context,
  });
}

export { ENABLE_GHL_SYNC };

