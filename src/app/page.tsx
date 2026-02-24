'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import ResultViewer from '@/components/ResultViewer'

const ASPECT_RATIOS = [
  { label: '4:5', sub: 'Instagram Feed', value: '4:5' },
  { label: '1:1', sub: 'Cuadrado', value: '1:1' },
  { label: '9:16', sub: 'Stories / TikTok', value: '9:16' },
  { label: '16:9', sub: 'Landscape', value: '16:9' },
  { label: '3:4', sub: 'Portrait', value: '3:4' },
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

// Minimal labeled input
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
  transition: 'border-color 0.2s ease',
}

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

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

  const getFocusStyle = (name: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedInput === name ? 'var(--accent)' : 'var(--border)',
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
        background: 'rgba(12, 12, 11, 0.92)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'var(--text)',
            letterSpacing: '-0.01em',
          }}>
            Morfeo Creative
          </span>
          <span style={{
            fontSize: '10px', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            AI Visual Studio
          </span>
        </div>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)',
        }} title="Online" />
      </header>

      {/* Content */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '0',
      }}>

        {/* LEFT — Form */}
        <div style={{
          borderRight: '1px solid var(--border-light)',
          padding: '36px 32px',
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontStyle: 'italic',
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.1,
            }}>
              Nueva generación
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Completá los datos de la marca y corré el workflow.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Brand + URL */}
            <Field label="Marca" required>
              <input
                type="text"
                required
                value={form.brand_profile}
                onChange={e => setField('brand_profile', e.target.value)}
                onFocus={() => setFocusedInput('brand')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Nike, Rayban, Morfeo..."
                style={getFocusStyle('brand')}
              />
            </Field>

            <Field label="URL del producto o página">
              <input
                type="url"
                value={form.product_url}
                onChange={e => setField('product_url', e.target.value)}
                onFocus={() => setFocusedInput('url')}
                onBlur={() => setFocusedInput(null)}
                placeholder="https://marca.com/producto"
                style={getFocusStyle('url')}
              />
              <p style={{ color: 'var(--text-faint)', fontSize: '11px', marginTop: '4px' }}>
                El workflow analiza colores, estilo y paleta de la marca.
              </p>
            </Field>

            <Field label="Brief creativo">
              <textarea
                rows={3}
                value={form.creative_brief}
                onChange={e => setField('creative_brief', e.target.value)}
                onFocus={() => setFocusedInput('brief')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Describí la idea, concepto o mensaje..."
                style={{ ...getFocusStyle('brief'), resize: 'none' }}
              />
            </Field>

            {/* Format selector */}
            <Field label="Formato de output">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setField('aspect_ratio', r.value)}
                    style={{
                      padding: '6px 12px',
                      border: `1px solid ${form.aspect_ratio === r.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '3px',
                      background: form.aspect_ratio === r.value ? 'var(--accent-dim)' : 'transparent',
                      color: form.aspect_ratio === r.value ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1px',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{r.label}</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>{r.sub}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Language */}
            <Field label="Idioma">
              <div style={{ display: 'flex', gap: '6px' }}>
                {[{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }].map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setField('language', l.value)}
                    style={{
                      padding: '7px 16px',
                      border: `1px solid ${form.language === l.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '3px',
                      background: form.language === l.value ? 'var(--accent-dim)' : 'transparent',
                      color: form.language === l.value ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Image uploads */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '14px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{
                  color: 'var(--text-muted)', fontSize: '10px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Referencias visuales</span>
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
                background: 'rgba(232, 84, 84, 0.08)',
                border: '1px solid rgba(232, 84, 84, 0.3)',
                borderRadius: '4px',
                padding: '10px 14px',
                color: 'var(--error)',
                fontSize: '12px',
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button
                type="submit"
                disabled={loading || !form.brand_profile}
                style={{
                  flex: 1,
                  background: loading || !form.brand_profile ? 'var(--surface-2)' : 'var(--accent)',
                  color: loading || !form.brand_profile ? 'var(--text-muted)' : 'var(--bg)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '11px 20px',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  cursor: loading || !form.brand_profile ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {loading ? 'iniciando...' : 'Generar visual →'}
              </button>

              {(runId || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '11px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                  }}
                >
                  Nueva
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT — Output */}
        <div style={{
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontStyle: 'italic',
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.1,
            }}>
              Output
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              El resultado generado aparecerá acá.
            </p>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: runId ? 'flex-start' : 'center',
            justifyContent: 'center',
          }}>
            {runId ? (
              <div style={{ width: '100%' }}>
                <ResultViewer
                  runId={runId}
                  brand={form.brand_profile}
                  aspectRatio={form.aspect_ratio}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
