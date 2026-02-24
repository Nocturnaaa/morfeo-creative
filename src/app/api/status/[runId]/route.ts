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

  // Extract output image URL if done
  let outputUrl: string | undefined
  if (statusData.status === 'success' && statusData.outputs?.length) {
    const images = statusData.outputs[0]?.data?.images
    if (images?.length) {
      outputUrl = images[0].url
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

  return NextResponse.json({
    status: statusData.status,
    output_url: outputUrl,
  })
}
