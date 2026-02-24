import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('generations')
    .select('id, created_at, brand_profile, aspect_ratio, status, output_url, run_id, creative_brief')
    .eq('status', 'success')
    .not('output_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (brand) {
    query = query.ilike('brand_profile', `%${brand}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
