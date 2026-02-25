'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Generation } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function Gallery() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Generation | null>(null)
  // All unique brands — loaded once, independent of active filter
  const [brands, setBrands] = useState<string[]>([])

  // Load all brand names once at mount (no filter)
  useEffect(() => {
    fetch('/api/generations')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Set((data as Generation[]).map(g => g.brand_profile))).sort()
          setBrands(unique)
        }
      })
      .catch(() => {})
  }, [])

  const fetchGenerations = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter ? `?brand=${encodeURIComponent(filter)}` : ''
      const res = await fetch(`/api/generations${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setGenerations(data)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchGenerations() }, [fetchGenerations])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

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
        <nav style={{ display: 'flex', gap: '4px' }}>
          <Link href="/" style={{
            padding: '5px 12px', borderRadius: '3px',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>Studio</Link>
          <span style={{
            padding: '5px 12px', borderRadius: '3px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            color: 'var(--accent)', fontSize: '11px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Galería</span>
        </nav>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>

        {/* Page title + filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '32px',
              fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.1, marginBottom: '4px',
            }}>Galería</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {generations.length} generaciones guardadas
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Brand filter */}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '4px', padding: '7px 12px',
                color: filter ? 'var(--text)' : 'var(--text-muted)',
                fontSize: '12px', fontFamily: 'var(--font-mono), monospace',
                cursor: 'pointer',
              }}
            >
              <option value="">Todas las marcas</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <Link href="/" style={{
              padding: '7px 16px',
              background: 'var(--accent)', color: 'var(--bg)',
              borderRadius: '4px', fontSize: '11px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', fontWeight: 500,
              fontFamily: 'var(--font-mono), monospace',
            }}>+ Nueva</Link>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Cargando...
          </div>
        ) : generations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '64px', height: '64px', border: '1px solid var(--border)',
              borderRadius: '4px', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--text-faint)', borderRadius: '2px' }} />
            </div>
            <p style={{ color: 'var(--text-faint)', fontSize: '13px' }}>
              {filter ? `Sin generaciones para "${filter}"` : 'Todavía no hay generaciones.'}
            </p>
            <Link href="/" style={{
              display: 'inline-block', marginTop: '16px',
              color: 'var(--accent)', fontSize: '12px', textDecoration: 'none',
              letterSpacing: '0.06em',
            }}>Crear la primera →</Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {generations.map(g => (
              <div
                key={g.id}
                onClick={() => setSelected(g)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingTop: '100%', background: 'var(--surface-2)' }}>
                  {g.output_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.output_url}
                      alt={g.brand_profile}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>
                {/* Meta */}
                <div style={{ padding: '10px 12px' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: '15px', color: 'var(--text)', marginBottom: '3px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{g.brand_profile}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      {g.aspect_ratio}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                      {formatDate(g.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', overflow: 'hidden',
              maxWidth: '600px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {selected.output_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.output_url}
                alt={selected.brand_profile}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            )}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: '20px', color: 'var(--text)', marginBottom: '4px',
                  }}>{selected.brand_profile}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.06em' }}>
                    {selected.aspect_ratio} · {formatDate(selected.created_at)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={selected.output_url}
                    download target="_blank" rel="noopener noreferrer"
                    style={{
                      padding: '7px 14px', background: 'var(--accent)',
                      color: 'var(--bg)', borderRadius: '3px',
                      fontSize: '11px', letterSpacing: '0.08em',
                      textTransform: 'uppercase', textDecoration: 'none',
                      fontWeight: 500, fontFamily: 'var(--font-mono), monospace',
                    }}
                  >Descargar</a>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      padding: '7px 10px', background: 'transparent',
                      border: '1px solid var(--border)', borderRadius: '3px',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >✕</button>
                </div>
              </div>
              {selected.creative_brief && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                  &ldquo;{selected.creative_brief}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
