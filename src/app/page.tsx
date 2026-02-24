'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import ResultViewer from '@/components/ResultViewer'

const ASPECT_RATIOS = [
  { label: '4:5 (Instagram Feed)', value: '4:5' },
  { label: '1:1 (Cuadrado)', value: '1:1' },
  { label: '9:16 (Stories / TikTok)', value: '9:16' },
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '3:4 (Portrait)', value: '3:4' },
]

const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
]

interface FormState {
  brand_profile: string
  product_url: string
  creative_brief: string
  aspect_ratio: string
  language: string
  producto: string
  model: string
  marca: string
  referencia: string
}

const DEFAULT_FORM: FormState = {
  brand_profile: '',
  product_url: '',
  creative_brief: '',
  aspect_ratio: '4:5',
  language: 'es',
  producto: '',
  model: '',
  marca: '',
  referencia: '',
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setField = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleImageUpload = (field: string, url: string) =>
    setForm(prev => ({ ...prev, [field]: url }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand_profile) return

    setError(null)
    setLoading(true)
    setRunId(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRunId(data.run_id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar el workflow'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setRunId(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            🎨 Morfeo Creative
          </h1>
          <p className="text-purple-300 text-lg">
            Generación de visuales con IA para tu agencia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-6">Nueva generación</h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Brand name */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  Nombre de marca *
                </label>
                <input
                  type="text"
                  required
                  value={form.brand_profile}
                  onChange={e => setField('brand_profile', e.target.value)}
                  placeholder="ej: Nike, Rayban, Morfeo..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Product URL */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  URL del producto o marca
                  <span className="text-white/40 font-normal"> (opcional — el workflow analiza colores y estilo)</span>
                </label>
                <input
                  type="url"
                  value={form.product_url}
                  onChange={e => setField('product_url', e.target.value)}
                  placeholder="https://www.marca.com/producto"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Creative brief */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  Brief creativo
                  <span className="text-white/40 font-normal"> (opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.creative_brief}
                  onChange={e => setField('creative_brief', e.target.value)}
                  placeholder="Describí la idea, concepto o mensaje que querés transmitir..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Aspect ratio + Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">
                    Formato
                  </label>
                  <select
                    value={form.aspect_ratio}
                    onChange={e => setField('aspect_ratio', e.target.value)}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {ASPECT_RATIOS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">
                    Idioma
                  </label>
                  <select
                    value={form.language}
                    onChange={e => setField('language', e.target.value)}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image uploads */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-medium text-purple-200 mb-3">
                  📎 Imágenes de referencia
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="[&_label]:text-purple-200 [&_div]:border-white/20 [&_div]:bg-white/5 [&_div]:text-white/50">
                    <ImageUpload label="Foto de producto" field="producto" onUpload={handleImageUpload} />
                  </div>
                  <div className="[&_label]:text-purple-200 [&_div]:border-white/20 [&_div]:bg-white/5 [&_div]:text-white/50">
                    <ImageUpload label="Foto de modelo" field="model" onUpload={handleImageUpload} />
                  </div>
                  <div className="[&_label]:text-purple-200 [&_div]:border-white/20 [&_div]:bg-white/5 [&_div]:text-white/50">
                    <ImageUpload label="Logo de marca" field="marca" onUpload={handleImageUpload} />
                  </div>
                  <div className="[&_label]:text-purple-200 [&_div]:border-white/20 [&_div]:bg-white/5 [&_div]:text-white/50">
                    <ImageUpload label="Referencia visual" field="referencia" onUpload={handleImageUpload} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !form.brand_profile}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? '⏳ Iniciando...' : '🚀 Generar visual'}
                </button>
                {(runId || error) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm"
                  >
                    Nueva
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Result panel */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 flex items-center justify-center min-h-[400px]">
            {runId ? (
              <ResultViewer runId={runId} />
            ) : (
              <div className="text-center text-white/30">
                <div className="text-6xl mb-4">🖼️</div>
                <p>El output aparecerá aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
