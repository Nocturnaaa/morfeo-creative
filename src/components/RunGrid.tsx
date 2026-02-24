'use client'

import ResultViewer from './ResultViewer'

interface Props {
  runIds: string[]
  brand?: string
  aspectRatio?: string
}

export default function RunGrid({ runIds, brand, aspectRatio }: Props) {
  if (runIds.length === 0) return null

  const isSingle = runIds.length === 1

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isSingle ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '16px',
      width: '100%',
    }}>
      {runIds.map((runId, i) => (
        <div
          key={runId}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {runIds.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                Variación {i + 1}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            </div>
          )}
          <ResultViewer
            runId={runId}
            brand={brand}
            aspectRatio={aspectRatio}
          />
        </div>
      ))}
    </div>
  )
}
