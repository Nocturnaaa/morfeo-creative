const COMFY_API_BASE = 'https://api.comfydeploy.com'
const API_KEY = process.env.COMFY_DEPLOY_API_KEY!
const DEPLOYMENT_ID = process.env.COMFY_DEPLOY_DEPLOYMENT_ID!

export interface GenerateInputs {
  producto?: string     // product image URL
  product_url?: string  // brand/product page URL
  model?: string        // model photo URL
  marca?: string        // brand logo URL
  brand_profile: string // brand name
  prompt_profile: string
  aspect_ratio: string
  referencia?: string   // visual reference URL
  creative_brief?: string
  language: string
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

export async function startRun(inputs: GenerateInputs): Promise<string> {
  const body = {
    deployment_id: DEPLOYMENT_ID,
    inputs: {
      ...inputs,
      // Remove undefined values
      ...(inputs.producto ? { producto: inputs.producto } : {}),
      ...(inputs.model ? { model: inputs.model } : {}),
      ...(inputs.marca ? { marca: inputs.marca } : {}),
      ...(inputs.referencia ? { referencia: inputs.referencia } : {}),
    }
  }

  const res = await fetch(`${COMFY_API_BASE}/api/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ComfyDeploy error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.run_id as string
}

export async function getRunStatus(runId: string): Promise<RunStatus> {
  const res = await fetch(`${COMFY_API_BASE}/api/run?run_id=${runId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  })

  if (!res.ok) {
    throw new Error(`ComfyDeploy status error: ${res.status}`)
  }

  return res.json()
}
