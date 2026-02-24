import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()
  const results: Record<string, unknown> = {}

  // 1. Check env vars are set
  results.env = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ missing',
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ set' : '❌ missing',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing',
    service_key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + '...',
  }

  // 2. List buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  results.buckets = bucketsError
    ? { error: bucketsError.message }
    : buckets?.map(b => ({ name: b.name, public: b.public }))

  // 3. Test upload a tiny file to morfeo-assets
  const testContent = new TextEncoder().encode('test')
  const { error: uploadError } = await supabase.storage
    .from('morfeo-assets')
    .upload(`_debug/test-${Date.now()}.txt`, testContent, {
      contentType: 'text/plain',
      upsert: true,
    })

  results.upload_test = uploadError
    ? { error: uploadError.message, details: JSON.stringify(uploadError) }
    : '✅ upload ok'

  return NextResponse.json(results, { status: 200 })
}
