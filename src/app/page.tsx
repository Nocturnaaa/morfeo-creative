'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import RunGrid from '@/components/RunGrid'
import BrandSelector from '@/components/BrandSelector'
import { Brand } from '@/lib/types'

const ASPECT_RATIOS = [
  { label: '4:5', sub: 'Feed', value: '4:5' },
  { label: '1:1', sub: 'Square', value: '1:1' },
  { label: '9:16', sub: 'Stories', value: '9:16' },
  { label: '16:9', sub: 'Wide', value: '16:9' },
  { label: '3:4', sub: 'Portrait', value: '3:4' },
]

const COUNTS = [1, 3, 5]

interface FormState {
  brand_profile: string
  product_url: string
  creative_brief: string
  aspect_ratio: string
  language: string
  count: number
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
  count: 1,
  producto: '',
  model: '',
  marca: '',
  referencia: '',
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
      {hint && (
        <p style={{ color: 'var(--text-faint)', fontSize: '11px', marginTop: '4px' }}>{hint}</p>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
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
    padding: '6px 14px',
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
      brand_profile: brand.brand_profile,
      product_url: brand.product_url || prev.product_url,
      marca: brand.logo_url || prev.marca,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand_profile) return

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
    ...inputStyle,
    borderColor: focused === name ? 'var(--accent)' : 'var(--border)',
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        padding: '0 32px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(12,12,11,0.92)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px', fontStyle: 'italic',
            color: 'var(--text)', letterSpacing: '-0.01em',
          }}>Morfeo Creative</span>
          <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            AI Visual Studio
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{
            padding: '5px 12px', borderRadius: '3px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Studio</span>
          <Link href="/gallery" style={{
            padding: '5px 12px', borderRadius: '3px',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'all 0.15s ease',
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
        <div style={{ borderRight: '1px solid var(--border-light)', padding: '32px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '26px',
              fontStyle: 'italic', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.1,
            }}>Nueva generación</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Completá los datos y corré el workflow.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Brand selector */}
            <Field label="Marca guardada">
              <BrandSelector
                brandProfile={form.brand_profile}
                productUrl={form.product_url}
                logoUrl={form.marca}
                onSelect={handleBrandSelect}
                onSave={() => {}}
              />
            </Field>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              <span style={{ color: 'var(--text-faint)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                o completá manualmente
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            </div>

            {/* Brand name */}
            <Field label="Nombre de marca" required>
              <input
                type="text" required
                value={form.brand_profile}
                onChange={e => setField('brand_profile', e.target.value)}
                onFocus={() => setFocused('brand')}
                onBlur={() => setFocused(null)}
                placeholder="Nike, Rayban, Morfeo..."
                style={focusStyle('brand')}
              />
            </Field>

            {/* Product URL */}
            <Field label="URL del producto o marca" hint="El workflow analiza colores y estilo de la página.">
              <input
                type="url"
                value={form.product_url}
                onChange={e => setField('product_url', e.target.value)}
                onFocus={() => setFocused('url')}
                onBlur={() => setFocused(null)}
                placeholder="https://marca.com/producto"
                style={focusStyle('url')}
              />
            </Field>

            {/* Creative brief */}
            <Field label="Brief creativo">
              <textarea
                rows={3}
                value={form.creative_brief}
                onChange={e => setField('creative_brief', e.target.value)}
                onFocus={() => setFocused('brief')}
                onBlur={() => setFocused(null)}
                placeholder="Describí la idea, concepto o mensaje..."
                style={{ ...focusStyle('brief'), resize: 'none' }}
              />
            </Field>

            {/* Aspect ratio */}
            <Field label="Formato">
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {ASPECT_RATIOS.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setField('aspect_ratio', r.value)}
                    style={{
                      ...toggleBtn(form.aspect_ratio === r.value),
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '1px', padding: '6px 10px',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{r.label}</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>{r.sub}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Language + Count */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Idioma">
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[{ label: 'ES', value: 'es' }, { label: 'EN', value: 'en' }].map(l => (
                    <button key={l.value} type="button"
                      onClick={() => setField('language', l.value)}
                      style={toggleBtn(form.language === l.value)}
                    >{l.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Variaciones">
                <div style={{ display: 'flex', gap: '5px' }}>
                  {COUNTS.map(n => (
                    <button key={n} type="button"
                      onClick={() => setField('count', n)}
                      style={toggleBtn(form.count === n)}
                    >{n}</button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Image uploads */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Referencias visuales
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <ImageUpload label="Producto" field="producto" onUpload={handleImageUpload} />
                <ImageUpload label="Modelo" field="model" onUpload={handleImageUpload} />
                <ImageUpload label="Logo de marca" field="marca" onUpload={handleImageUpload} />
                <ImageUpload label="Referencia" field="referencia" onUpload={handleImageUpload} />
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
              <button type="submit" disabled={loading || !form.brand_profile}
                style={{
                  flex: 1,
                  background: loading || !form.brand_profile ? 'var(--surface-2)' : 'var(--accent)',
                  color: loading || !form.brand_profile ? 'var(--text-muted)' : 'var(--bg)',
                  border: 'none', borderRadius: '4px',
                  padding: '11px 20px', fontSize: '12px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontWeight: 500, cursor: loading || !form.brand_profile ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-mono), monospace',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? `iniciando ${form.count > 1 ? `${form.count} variaciones` : ''}...`
                  : `Generar${form.count > 1 ? ` × ${form.count}` : ''} →`}
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
        <div style={{ padding: '32px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '26px',
              fontStyle: 'italic', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.1,
            }}>Output</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {runIds.length > 1
                ? `${runIds.length} variaciones generándose en paralelo`
                : 'El resultado generado aparecerá acá.'}
            </p>
          </div>

          {runIds.length > 0 ? (
            <RunGrid runIds={runIds} brand={form.brand_profile} aspectRatio={form.aspect_ratio} />
          ) : (
            <div style={{
              height: '400px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{
                width: '64px', height: '64px',
                border: '1px solid var(--border)', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          Powered by ComfyDeploy
        </span>
      </footer>
    </main>
  )
}
