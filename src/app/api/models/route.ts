import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export interface ModelImage {
  name: string
  url: string
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const { data, error } = await supabase.storage
    .from('models')
    .list('', { limit: 500, sortBy: { column: 'name', order: 'asc' } })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ models: [] })
  }

  const models: ModelImage[] = data
    .filter(f => f.name && !f.name.startsWith('.'))
    .map(f => ({
      name: f.name,
      url: `${SUPABASE_URL}/storage/v1/object/public/models/${f.name}`,
    }))

  return NextResponse.json({ models })
}
