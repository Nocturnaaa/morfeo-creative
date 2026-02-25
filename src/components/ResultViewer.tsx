'use client'

import { useEffect, useState } from 'react'

interface Props {
  runId: string
  brand?: string
  aspectRatio?: string
  onComplete?: (outputUrl: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'en cola',
  'running': 'generando',
  'uploading': 'procesando',
  'success': 'recuperando imagen',
  'failed': 'error',
}

export default function ResultViewer({ runId, brand, aspectRatio, onComplete }: Props) {
  const [status, setStatus] = useState<string>('running')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Elapsed timer
  useEffect(() => {
    if (status === 'success' || status === 'failed') return
    const i = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(i)
  }, [status])

  // Poll status — keep polling until we have BOTH success AND outputUrl
  useEffect(() => {
    if ((status === 'success' && outputUrl) || status === 'failed') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${runId}`)
        const data = await res.json()
        setStatus(data.status)
        if (data.output_url) {
          setOutputUrl(data.output_url)
          onComplete?.(data.output_url)
        }
      } catch { /* retry */ }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [runId, status, outputUrl, onComplete])

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: 'var(--error)', fontSize: '28px', marginBottom: '12px' }}>✕</div>
        <p style={{ color: 'var(--error)', fontSize: '13px' }}>El workflow falló.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Revisá los inputs e intentá de nuevo.</p>
      </div>
    )
  }

  if (status !== 'success' || !outputUrl) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        {/* Animated loader */}
        <div style={{ position: 'relative', width: '48px', height: '48px', margin: '0 auto 24px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px solid var(--border)',
            borderTop: '1px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p style={{ color: 'var(--text)', fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
          {STATUS_LABELS[status] || status}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {elapsed}s — el workflow está procesando tu visual
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: '3px', height: '20px',
              background: 'var(--border)',
              borderRadius: '2px',
              animation: `bar-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes bar-pulse {
            0%, 100% { transform: scaleY(0.4); background: var(--border); }
            50% { transform: scaleY(1); background: var(--accent); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Image */}
      <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outputUrl}
          alt="Output generado"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {/* Overlay badge */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          padding: '24px 16px 14px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            {brand && (
              <p style={{ color: 'white', fontSize: '13px', fontStyle: 'italic', fontFamily: 'var(--font-display)', marginBottom: '2px' }}>
                {brand}
              </p>
            )}
            {aspectRatio && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {aspectRatio}
              </p>
            )}
          </div>
          <a
            href={outputUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
              padding: '6px 14px',
              borderRadius: '3px',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'background 0.2s ease',
            }}
          >
            Descargar
          </a>
        </div>
      </div>
      <div style={{
        marginTop: '12px',
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--success)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase'
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
        Visual generada correctamente
      </div>
    </div>
  )
}
