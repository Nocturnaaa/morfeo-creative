export interface Generation {
  id: string
  created_at: string
  brand_profile: string
  product_url?: string
  creative_brief?: string
  aspect_ratio: string
  language: string
  run_id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  output_url?: string
  inputs_json: string
}
