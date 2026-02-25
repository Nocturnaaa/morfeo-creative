import { NextRequest, NextResponse } from 'next/server'
import { getRunStatus } from '@/lib/comfydeploy'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params

  let statusData
  try {
    statusData = await getRunStatus(runId)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Extract output image URL if done — handle multiple possible ComfyDeploy output shapes
  let outputUrl: string | undefined
  if (statusData.status === 'success' && statusData.outputs?.length) {
    for (const output of statusData.outputs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out = output as any
      // Shape 1: output.data.images[0].url
      if (out?.data?.images?.length) {
        outputUrl = out.data.images[0].url
        break
      }
      // Shape 2: output.data.url (direct)
      if (out?.data?.url) {
        outputUrl = out.data.url
        break
      }
      // Shape 3: output.url (flat)
      if (out?.url) {
        outputUrl = out.url
        break
      }
    }
  }

  // Update DB record
  if (statusData.status === 'success' || statusData.status === 'failed') {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('generations')
      .update({
        status: statusData.status,
        output_url: outputUrl,
      })
      .eq('run_id', runId)
  }

  // Debug: log raw outputs when success but no URL found
  if (statusData.status === 'success' && !outputUrl) {
    console.warn('[status] success but no outputUrl — raw outputs:', JSON.stringify(statusData.outputs))
  }

  return NextResponse.json({
    status: statusData.status,
    output_url: outputUrl,
  })
}
