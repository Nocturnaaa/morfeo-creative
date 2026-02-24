'use client'

import { useState, useRef } from 'react'

interface Props {
  label: string
  field: string
  onUpload: (field: string, url: string) => void
}

export default function ImageUpload({ label, field, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpload(field, data.url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir'
      setError(message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onUpload(field, '')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          position: 'relative',
          border: `1px dashed ${preview ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '6px',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: preview ? 'default' : 'pointer',
          background: preview ? 'var(--accent-dim)' : 'var(--surface)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {uploading ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>subiendo...</span>
        ) : preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
            <button
              onClick={handleClear}
              style={{
                position: 'absolute', top: '4px', right: '4px',
                background: 'rgba(0,0,0,0.7)', border: 'none',
                color: 'white', width: '20px', height: '20px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>+</div>
            <div style={{ fontSize: '10px', letterSpacing: '0.05em' }}>PNG · JPG · WEBP</div>
          </div>
        )}
      </div>
      {error && <p style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
