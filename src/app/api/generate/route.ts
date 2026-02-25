import { NextRequest, NextResponse } from 'next/server'
import { startRun, AdsInputs } from '@/lib/comfydeploy'
import { getSupabaseAdmin } from '@/lib/supabase'
import { findProfile, formatAdType } from '@/lib/ad-profiles'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 10)
  const sessionId = randomUUID()

  // Validate profile
  const profile = findProfile(body.profile_id)
  if (!profile) {
    return NextResponse.json({ error: `Profile not found: ${body.profile_id}` }, { status: 400 })
  }

  const inputs: AdsInputs = {
    user_brief: `USER_BRIEF:\n\n${body.user_brief || ''}`,
    target_audience: `TARGET AUDIENCE:\n\n${body.target_audience || ''}`,
    language: `Language: ${(body.language || 'es').toUpperCase()}`,
    seed: 0, // overridden per run
    ad_type: formatAdType(profile),
    aspect_ratio: body.aspect_ratio || '4:5',
    product: body.product || undefined,
    logo: body.logo || undefined,
    model: body.model || undefined,
  }

  // Fire N runs in parallel with different seeds
  const runResults = await Promise.allSettled(
    Array.from({ length: count }, () => {
      const seed = Math.floor(Math.random() * 999999)
      return startRun({ ...inputs, seed })
    })
  )

  const runIds: string[] = runResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)

  if (runIds.length === 0) {
    return NextResponse.json({ error: 'All runs failed to start' }, { status: 500 })
  }

  // Save to Supabase
  const supabase = getSupabaseAdmin()
  await supabase.from('generations').insert(
    runIds.map((runId, i) => ({
      brand_profile: body.brand_name || profile.label,
      product_url: null,
      creative_brief: body.user_brief,
      aspect_ratio: body.aspect_ratio || '4:5',
      language: body.language || 'es',
      run_id: runId,
      status: 'running',
      inputs_json: JSON.stringify({ ...body, profile_label: profile.label }),
      session_id: sessionId,
      variation_index: i,
    }))
  )

  return NextResponse.json({ run_ids: runIds, session_id: sessionId })
}
