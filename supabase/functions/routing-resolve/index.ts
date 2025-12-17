import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ResolveRoutingRequest, ResolveRoutingResponse } from "../_shared/api-types.ts"
import { resolveRouting } from "../_shared/routing-engine.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname

  try {
    // Initialize Supabase Client (Service Role)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // POST /routing/resolve
    if (req.method === 'POST' && path.endsWith('/routing/resolve')) {
      const { zip, context } = await req.json() as ResolveRoutingRequest;

      if (!zip) {
         throw new Error('ZIP code is required');
      }

      // Use shared routing engine
      const result = await resolveRouting(supabase, zip);

      const response: ResolveRoutingResponse = {
        outcome: result.outcome,
        practice_id: result.practice_id,
        practice_details: result.practice_details,
        reason: result.reason,
      }

      // Requirement: "Always return routing_snapshot"
      return new Response(JSON.stringify({ ...response, routing_snapshot: result.routing_snapshot }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
