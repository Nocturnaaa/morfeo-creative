const COMFY_API_BASE = 'https://api.comfydeploy.com'
const API_KEY = process.env.COMFY_DEPLOY_API_KEY!

// Workflow: ADS 1.19 Morpheus
const ADS_DEPLOYMENT_ID = 'cc363292-d66d-4fe6-94c0-d8a89dac82db'

export interface AdsInputs {
  product?: string       // product image URL
  logo?: string          // brand logo URL
  model?: string         // talent/model image URL
  user_brief: string     // formatted: "USER_BRIEF:\n\n{content}"
  target_audience: string // formatted: "TARGET AUDIENCE:\n\n{content}"
  language: string       // formatted: "Language: ES"
  seed: number
  ad_type: string        // serialized profile JSON
  aspect_ratio: string
}

export interface RunStatus {
  id: string
  status: 'not-started' | 'running' | 'uploading' | 'success' | 'failed'
  outputs?: Array<{
    data?: {
      images?: Array<{ url: string; filename: string }>
    }
  }>
}

export function buildAdsPayload(inputs: AdsInputs) {
  const payload: Record<string, string | number> = {
    'USER_BRIEF': inputs.user_brief,
    'TARGET_AUDIENCE': inputs.target_audience,
    'LANGUAGE': inputs.language,
    'seed': inputs.seed,
    'ad_type': inputs.ad_type,
    'aspect_ratio': inputs.aspect_ratio,
  }
  if (inputs.product) payload['product'] = inputs.product
  if (inputs.logo) payload['logo'] = inputs.logo
  if (inputs.model) payload['model'] = inputs.model
  return payload
}

export async function startRun(inputs: AdsInputs): Promise<string> {
  const res = await fetch(`${COMFY_API_BASE}/api/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deployment_id: ADS_DEPLOYMENT_ID,
      inputs: buildAdsPayload(inputs),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ComfyDeploy error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.run_id as string
}

export async function getRunStatus(runId: string): Promise<RunStatus> {
  const res = await fetch(`${COMFY_API_BASE}/api/run?run_id=${runId}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Status error: ${res.status}`)
  return res.json()
}
