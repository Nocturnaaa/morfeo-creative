import { NextRequest, NextResponse } from 'next/server'
import { startRun, GenerateInputs } from '@/lib/comfydeploy'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()

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

  let runId: string
  try {
    runId = await startRun(inputs)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Save generation record to Supabase
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('generations')
    .insert({
      brand_profile: inputs.brand_profile,
      product_url: inputs.product_url,
      creative_brief: inputs.creative_brief,
      aspect_ratio: inputs.aspect_ratio,
      language: inputs.language,
      run_id: runId,
      status: 'running',
      inputs_json: JSON.stringify(inputs),
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
  }

  return NextResponse.json({ run_id: runId, id: data?.id })
}
