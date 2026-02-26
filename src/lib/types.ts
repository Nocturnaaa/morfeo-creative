export interface Generation {
  id: string
  created_at: string
  brand_profile: string
  product_url?: string
  creative_brief?: string
  aspect_ratio: string
  language: string
  run_id: string
  status: 'running' | 'success' | 'failed'
  output_url?: string
  inputs_json: string
  session_id?: string
  variation_index?: number
}

export interface BrandSettings {
  brand_name?: string
  target_audience?: string
  user_brief?: string
  aspect_ratio?: string
  language?: string
  profile_id?: string
  product?: string
  logo?: string
  models?: string[]
}

export interface Brand {
  id: string
  created_at: string
  name: string
  brand_profile: string
  product_url?: string
  logo_url?: string
  settings_json?: BrandSettings
}
