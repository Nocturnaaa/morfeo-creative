'use client'

import { useEffect, useState, useMemo } from 'react'

interface ModelImage {
  name: string
  url: string
}

interface Props {
  maxSelect: number       // max = current variation count
  selected: string[]      // array of selected model URLs
  onChange: (urls: string[]) => void
}

export default function ModelSelector({ maxSelect, selected, onChange }: Props) {
  const [models, setModels] = useState<ModelImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        setModels(data.models || [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar la biblioteca')
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() =>
    query.trim()
      ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
      : models,
    [models, query]
  )

  const toggle = (url: string) => {
    const idx = selected.indexOf(url)
    if (idx >= 0) {
      // Deselect
      onChange(selected.filter(u => u !== url))
    } else if (selected.length < maxSelect) {
      // Select
      onChange([...selected, url])
    }
  }

  const clear = () => onChange([])

  const getSelectionIndex = (url: string) => selected.indexOf(url) + 1 // 1-based

  const selectionLabel = selected.length === 0
    ? 'Sin modelo'
    : selected.length === 1
      ? '1 modelo seleccionado'
      : `${selected.length} modelos seleccionados`

  return (
    <div>
      {/* Trigger row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '9px 12px',
            color: selected.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
        >
          <span>{selectionLabel}</span>
          <span style={{ fontSize: '10px', opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            onClick={clear}
            title="Limpiar selección"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '9px 10px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Selected preview row */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {selected.map((url, i) => (
            <div
              key={url}
              style={{
                position: 'relative',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--accent)',
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={() => toggle(url)}
              title="Click para quitar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Position badge */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--accent)',
                color: 'var(--bg)',
                fontSize: '9px',
                fontWeight: 700,
                textAlign: 'center',
                padding: '1px 0',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono), monospace',
              }}>
                V{i + 1}
              </div>
            </div>
          ))}
          {/* Empty slots */}
          {maxSelect > 1 && Array.from({ length: Math.max(0, maxSelect - selected.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'var(--font-mono), monospace' }}>
                V{selected.length + i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown grid */}
      {open && (
        <div style={{
          marginTop: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '7px 10px',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <p style={{
              marginTop: '6px',
              color: 'var(--text-faint)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono), monospace',
            }}>
              {loading ? 'Cargando...' : `${filtered.length} modelos`}
              {maxSelect > 1 && ` · Seleccioná hasta ${maxSelect} para las ${maxSelect} variaciones`}
            </p>
          </div>

          {/* Grid */}
          <div style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '12px',
          }}>
            {loading && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px', fontFamily: 'var(--font-mono), monospace', fontSize: '12px' }}>
                Cargando biblioteca...
              </p>
            )}
            {error && (
              <p style={{ textAlign: 'center', color: 'var(--error)', padding: '32px', fontSize: '12px' }}>{error}</p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono), monospace' }}>
                  {models.length === 0
                    ? 'La biblioteca está vacía. Subí imágenes al bucket "models" en Supabase.'
                    : 'Sin resultados para tu búsqueda.'
                  }
                </p>
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                gap: '8px',
              }}>
                {filtered.map(m => {
                  const selIdx = getSelectionIndex(m.url)
                  const isSelected = selIdx > 0
                  const isDisabled = !isSelected && selected.length >= maxSelect

                  return (
                    <div
                      key={m.name}
                      onClick={() => !isDisabled && toggle(m.url)}
                      title={m.name.replace(/\.[^.]+$/, '')}
                      style={{
                        position: 'relative',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        aspectRatio: '1',
                        border: isSelected
                          ? '2px solid var(--accent)'
                          : '2px solid transparent',
                        opacity: isDisabled ? 0.3 : 1,
                        transition: 'all 0.15s ease',
                        background: 'var(--bg)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt=""
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {/* Selected badge */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: 'var(--bg)',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono), monospace',
                        }}>
                          {selIdx}
                        </div>
                      )}
                      {/* Name tooltip on hover */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.75)',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '8px',
                        padding: '2px 4px',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-mono), monospace',
                      }}>
                        {m.name.replace(/\.[^.]+$/, '').slice(0, 14)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
