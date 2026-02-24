'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  label: string
  field: string
  onUpload: (field: string, url: string) => void
  optional?: boolean
}

export default function ImageUpload({ label, field, onUpload, optional = true }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)

    // Local preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to server
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpload(field, data.url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen'
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

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {optional && <span className="text-gray-400">(opcional)</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-xl cursor-pointer
          flex items-center justify-center min-h-[120px] transition-colors
          ${preview ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        `}
      >
        {uploading ? (
          <div className="text-center text-sm text-gray-500">
            <div className="animate-spin text-2xl mb-1">⏳</div>
            Subiendo...
          </div>
        ) : preview ? (
          <div className="relative w-full h-[120px]">
            <Image src={preview} alt={label} fill className="object-contain rounded-xl p-2" />
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 p-4">
            <div className="text-2xl mb-1">📎</div>
            <div>Click o arrastrá aquí</div>
            <div className="text-xs mt-1">PNG, JPG, WEBP</div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
