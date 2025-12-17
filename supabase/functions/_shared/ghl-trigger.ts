import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

export async function triggerGhlSync(
  entityType: 'lead' | 'appointment',
  entityId: string
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const internalSyncKey = Deno.env.get('INTERNAL_SYNC_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // If misconfigured, log via service role and exit
  if (!supabaseUrl || !internalSyncKey || !serviceRoleKey) {
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from('audit_log').insert({
        entity_type: entityType,
        entity_id: entityId,
        action: 'ghl_sync_trigger_skipped_misconfig',
        performed_by: 'system',
        metadata: { error: 'Missing env vars' }
      });
    }
    console.info('GHL Sync Trigger Skipped: Missing env vars');
    return;
  }

  const syncUrl = `${supabaseUrl}/functions/v1/ghl-sync`;

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalSyncKey
      },
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId
      })
    });

    if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
    }

  } catch (error) {
    console.error('GHL Sync Trigger Failed:', error);
    // Log failure to audit_log
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from('audit_log').insert({
        entity_type: entityType,
        entity_id: entityId,
        action: 'ghl_sync_trigger_failed',
        performed_by: 'system',
        metadata: { error: error.message }
      });
    } catch (logError) {
      console.error('Failed to log sync failure:', logError);
    }
  }
}

