'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import RunGrid from '@/components/RunGrid'
import BrandSelector from '@/components/BrandSelector'
import AdTypeSelector from '@/components/AdTypeSelector'
import { Brand } from '@/lib/types'

const ASPECT_RATIOS = [
  { label: '4:5',  sub: 'Feed',    value: '4:5'  },
  { label: '1:1',  sub: 'Square',  value: '1:1'  },
  { label: '9:16', sub: 'Stories', value: '9:16' },
  { label: '16:9', sub: 'Wide',    value: '16:9' },
  { label: '3:4',  sub: 'Portrait',value: '3:4'  },
]

const COUNTS = [1, 3, 5]

interface FormState {
  brand_name: string
  target_audience: string
  user_brief: string
  aspect_ratio: string
  language: string
  count: number
  profile_id: string
  product: string
  logo: string
  model: string
}

const DEFAULT_FORM: FormState = {
  brand_name: '',
  target_audience: '',
  user_brief: '',
  aspect_ratio: '4:5',
  language: 'es',
  count: 1,
  profile_id: 'standard',
  product: '',
  logo: '',
  model: '',
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: '6px',
        color: 'var(--text-muted)', fontSize: '11px',
        letterSpacing: '0.09em', textTransform: 'uppercase',
      }}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ color: 'var(--text-faint)', fontSize: '11px', marginTop: '4px' }}>{hint}</p>}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  padding: '9px 12px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '13px',
  transition: 'border-color 0.2s ease',
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: '3px',
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-mono), monospace',
  }
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [runIds, setRunIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const setField = (field: keyof FormState, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleImageUpload = (field: string, url: string) =>
    setForm(prev => ({ ...prev, [field]: url }))

  const handleBrandSelect = (brand: Brand) => {
    setForm(prev => ({
      ...prev,
      brand_name: brand.brand_profile,
      logo: brand.logo_url || prev.logo,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand_name || !form.profile_id) return

    setError(null)
    setLoading(true)
    setRunIds([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRunIds(data.run_ids)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setRunIds([])
    setError(null)
  }

  const focusStyle = (name: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: focused === name ? 'var(--accent)' : 'var(--border)',
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        padding: '0 32px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(12,12,11,0.92)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '20px',
            fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-0.01em',
          }}>Morfeo Creative</span>
          <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            AI Visual Studio
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{
            padding: '5px 12px', borderRadius: '3px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            color: 'var(--accent)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Studio</span>
          <Link href="/gallery" style={{
            padding: '5px 12px', borderRadius: '3px',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>Galería</Link>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--success)', boxShadow: '0 0 6px var(--success)',
            marginLeft: '8px',
          }} />
        </nav>
      </header>

      {/* Split layout */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1280px', margin: '0 auto', width: '100%',
      }}>

        {/* LEFT — Form */}
        <div style={{ borderRight: '1px solid var(--border-light)', padding: '28px 32px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px',
              fontStyle: 'italic', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.1,
            }}>Nueva generación</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              ADS 1.19 Morpheus — 20 perfiles publicitarios
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Brand selector */}
            <Field label="Marca guardada">
              <BrandSelector
                brandProfile={form.brand_name}
                productUrl={''}
                logoUrl={form.logo}
                onSelect={handleBrandSelect}
                onSave={() => {}}
              />
            </Field>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              <span style={{ color: 'var(--text-faint)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                datos de la marca
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            </div>

            {/* Brand name */}
            <Field label="Nombre de marca" required>
              <input
                type="text" required
                value={form.brand_name}
                onChange={e => setField('brand_name', e.target.value)}
                onFocus={() => setFocused('brand')}
                onBlur={() => setFocused(null)}
                placeholder="Nike, Morfeo, Quiero Ser Santo..."
                style={focusStyle('brand')}
              />
            </Field>

            {/* Target audience */}
            <Field label="Audiencia objetivo" hint="Quién verá este anuncio. Ej: Mujeres 25-35, interesadas en moda sostenible.">
              <textarea
                rows={2}
                value={form.target_audience}
                onChange={e => setField('target_audience', e.target.value)}
                onFocus={() => setFocused('audience')}
                onBlur={() => setFocused(null)}
                placeholder="Describe el público objetivo del anuncio..."
                style={{ ...focusStyle('audience'), resize: 'none' }}
              />
            </Field>

            {/* Brief */}
            <Field label="Brief creativo" hint="El mensaje, concepto o contexto del anuncio.">
              <textarea
                rows={3}
                value={form.user_brief}
                onChange={e => setField('user_brief', e.target.value)}
                onFocus={() => setFocused('brief')}
                onBlur={() => setFocused(null)}
                placeholder="Describí el objetivo del anuncio, la oferta o el mensaje clave..."
                style={{ ...focusStyle('brief'), resize: 'none' }}
              />
            </Field>

            {/* Ad type selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  tipo de creativo
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              </div>
              <AdTypeSelector
                value={form.profile_id}
                onChange={(id) => setField('profile_id', id)}
              />
            </div>

            {/* Format + Language + Count */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Formato">
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {ASPECT_RATIOS.map(r => (
                    <button key={r.value} type="button"
                      onClick={() => setField('aspect_ratio', r.value)}
                      style={{
                        ...toggleBtn(form.aspect_ratio === r.value),
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '1px', padding: '5px 8px',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: '11px' }}>{r.label}</span>
                      <span style={{ fontSize: '9px', opacity: 0.7 }}>{r.sub}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Idioma + Variaciones">
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {[{ label: 'ES', value: 'es' }, { label: 'EN', value: 'en' }].map(l => (
                    <button key={l.value} type="button"
                      onClick={() => setField('language', l.value)}
                      style={toggleBtn(form.language === l.value)}
                    >{l.label}</button>
                  ))}
                  <div style={{ width: '1px', background: 'var(--border)', margin: '0 2px' }} />
                  {COUNTS.map(n => (
                    <button key={n} type="button"
                      onClick={() => setField('count', n)}
                      style={toggleBtn(form.count === n)}
                    >×{n}</button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Image uploads */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  assets visuales
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <ImageUpload label="Producto" field="product" onUpload={handleImageUpload} />
                <ImageUpload label="Logo" field="logo" onUpload={handleImageUpload} />
                <ImageUpload label="Modelo" field="model" onUpload={handleImageUpload} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(232,84,84,0.08)', border: '1px solid rgba(232,84,84,0.3)',
                borderRadius: '4px', padding: '10px 14px',
                color: 'var(--error)', fontSize: '12px',
              }}>{error}</div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button type="submit"
                disabled={loading || !form.brand_name || !form.profile_id}
                style={{
                  flex: 1,
                  background: loading || !form.brand_name ? 'var(--surface-2)' : 'var(--accent)',
                  color: loading || !form.brand_name ? 'var(--text-muted)' : 'var(--bg)',
                  border: 'none', borderRadius: '4px',
                  padding: '11px 20px', fontSize: '12px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontWeight: 500,
                  cursor: loading || !form.brand_name ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-mono), monospace',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? `generando${form.count > 1 ? ` ×${form.count}` : ''}...`
                  : `Generar${form.count > 1 ? ` ×${form.count}` : ''} →`}
              </button>
              {(runIds.length > 0 || error) && (
                <button type="button" onClick={handleReset}
                  style={{
                    padding: '11px 16px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '4px',
                    color: 'var(--text-muted)', fontSize: '12px',
                    cursor: 'pointer', fontFamily: 'var(--font-mono), monospace',
                  }}
                >Nueva</button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT — Output */}
        <div style={{ padding: '28px 32px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px',
              fontStyle: 'italic', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.1,
            }}>Output</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {runIds.length > 1
                ? `${runIds.length} variaciones con seeds distintos`
                : 'El resultado aparecerá acá.'}
            </p>
          </div>

          {runIds.length > 0 ? (
            <RunGrid runIds={runIds} brand={form.brand_name} aspectRatio={form.aspect_ratio} />
          ) : (
            <div style={{
              height: '400px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{
                width: '64px', height: '64px', border: '1px solid var(--border)',
                borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--text-faint)', borderRadius: '2px' }} />
              </div>
              <p style={{ color: 'var(--text-faint)', fontSize: '12px', letterSpacing: '0.06em' }}>
                Esperando generación
              </p>
            </div>
          )}
        </div>
      </div>

      <footer style={{
        borderTop: '1px solid var(--border-light)', padding: '12px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: 'var(--text-faint)', fontSize: '11px', letterSpacing: '0.06em' }}>
          MORFEO CREATIVE · AI VISUAL STUDIO
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>
          ADS 1.19 Morpheus · ComfyDeploy
        </span>
      </footer>
    </main>
  )
}
