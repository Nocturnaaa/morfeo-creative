'use client'

import { useState } from 'react'
import { AD_CATEGORIES, AD_PROFILES } from '@/lib/ad-profiles'

interface Props {
  value: string
  onChange: (profileId: string) => void
}

const FUNNEL_COLORS: Record<string, string> = {
  'Awareness':     '#6B8CFF',
  'Consideration': '#F5A623',
  'Conversion':    '#5DC887',
  'Retention':     '#E87C5A',
  'Mid-Funnel':    '#B085FF',
  'Brand':         '#FF85D0',
  'Universal':     '#888880',
  'Especial':      '#5EC9E8',
}

export default function AdTypeSelector({ value, onChange }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('universal')

  const profiles = AD_PROFILES.filter(p => p.categoryId === activeCategory)
  const selected = AD_PROFILES.find(p => p.id === value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {AD_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '5px 10px',
              border: `1px solid ${activeCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '3px',
              background: activeCategory === cat.id ? 'var(--accent-dim)' : 'transparent',
              color: activeCategory === cat.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono), monospace',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Profile list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '6px',
      }}>
        {profiles.map(profile => {
          const isSelected = profile.id === value
          const funnelColor = FUNNEL_COLORS[profile.funnel] || 'var(--text-muted)'
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onChange(profile.id)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '4px',
                background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{
                color: isSelected ? 'var(--accent)' : 'var(--text)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono), monospace',
                fontWeight: isSelected ? 500 : 400,
                lineHeight: 1.3,
              }}>
                {profile.label}
              </span>
              <span style={{
                fontSize: '10px',
                color: funnelColor,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}>
                {profile.funnel}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected preview */}
      {selected && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <span style={{ color: 'var(--accent)', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {selected.label}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '8px' }}>
              {AD_CATEGORIES.find(c => c.id === selected.categoryId)?.emoji}{' '}
              {AD_CATEGORIES.find(c => c.id === selected.categoryId)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
