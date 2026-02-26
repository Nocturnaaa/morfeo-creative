'use client'

import { useEffect, useState } from 'react'
import { Brand, BrandSettings } from '@/lib/types'

interface Props {
  formSnapshot: BrandSettings   // full current form state to save
  onSelect: (brand: Brand) => void
  onSave: (name: string) => void
}

export default function BrandSelector({ formSnapshot, onSelect, onSave }: Props) {
  const brandProfile = formSnapshot.brand_name || ''
  const [brands, setBrands] = useState<Brand[]>([])
  const [selected, setSelected] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setBrands(data))
      .catch(() => {})
  }, [])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelected(val)
    if (!val) return
    const brand = brands.find(b => b.id === val)
    if (brand) onSelect(brand)
  }

  const handleSave = async () => {
    if (!saveName.trim() || !brandProfile) return
    setSaving(true)
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          brand_profile: brandProfile,
          product_url: formSnapshot.product || null,
          logo_url: formSnapshot.logo || null,
          settings_json: formSnapshot,   // full form snapshot
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBrands(prev => {
        const filtered = prev.filter(b => b.name !== data.name)
        return [...filtered, data].sort((a, b) => a.name.localeCompare(b.name))
      })
      setSelected(data.id)
      setShowSaveForm(false)
      setSaveName('')
      onSave(data.name)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    const brand = brands.find(b => b.id === selected)
    if (!brand || !confirm(`¿Eliminar "${brand.name}"?`)) return
    await fetch(`/api/brands?id=${selected}`, { method: 'DELETE' })
    setBrands(prev => prev.filter(b => b.id !== selected))
    setSelected('')
  }

  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <select
          value={selected}
          onChange={handleSelect}
          style={{
            ...mono,
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '8px 10px',
            color: selected ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <option value="">— Seleccionar marca guardada —</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {selected && (
          <button
            type="button"
            onClick={handleDelete}
            title="Eliminar marca"
            style={{
              ...mono,
              padding: '8px 10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--error)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >✕</button>
        )}

        {brandProfile && (
          <button
            type="button"
            onClick={() => setShowSaveForm(v => !v)}
            style={{
              ...mono,
              padding: '8px 12px',
              background: showSaveForm ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${showSaveForm ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '4px',
              color: showSaveForm ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Guardar
          </button>
        )}
      </div>

      {showSaveForm && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder={`Nombre (ej: ${brandProfile || 'Nike'})`}
            style={{
              ...mono,
              flex: 1,
              background: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              padding: '7px 10px',
              color: 'var(--text)',
              fontSize: '12px',
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !saveName.trim()}
            style={{
              ...mono,
              padding: '7px 14px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--bg)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}
