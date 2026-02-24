import { NextRequest, NextResponse } from 'next/server'
import { startRun, GenerateInputs } from '@/lib/comfydeploy'
import { getSupabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 10)
  const sessionId = randomUUID()

  const inputs: GenerateInputs = {
    brand_profile: body.brand_profile,
    product_url: body.product_url || undefined,
    aspect_ratio: body.aspect_ratio,
    creative_brief: body.creative_brief || '',
    language: body.language || 'es',
    prompt_profile: 'Master_prompt_09_Morfeo_Creative',
    producto: body.producto || undefined,
    model: body.model || undefined,
    marca: body.marca || undefined,
    referencia: body.referencia || undefined,
  }

  // Fire N runs in parallel
  const runResults = await Promise.allSettled(
    Array.from({ length: count }, () => startRun(inputs))
  )

  const runIds: string[] = runResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)

  if (runIds.length === 0) {
    return NextResponse.json({ error: 'All runs failed to start' }, { status: 500 })
  }

  // Save all runs to Supabase
  const supabase = getSupabaseAdmin()
  await supabase.from('generations').insert(
    runIds.map((runId, i) => ({
      brand_profile: inputs.brand_profile,
      product_url: inputs.product_url,
      creative_brief: inputs.creative_brief,
      aspect_ratio: inputs.aspect_ratio,
      language: inputs.language,
      run_id: runId,
      status: 'running',
      inputs_json: JSON.stringify(inputs),
      session_id: sessionId,
      variation_index: i,
    }))
  )

  return NextResponse.json({ run_ids: runIds, session_id: sessionId })
}
