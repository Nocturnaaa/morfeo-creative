'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props {
  runId: string
  onComplete?: (outputUrl: string) => void
}

export default function ResultViewer({ runId, onComplete }: Props) {
  const [status, setStatus] = useState<string>('running')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [dots, setDots] = useState('')

  // Animated dots
  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(i)
  }, [])

  // Poll status
  useEffect(() => {
    if (status === 'success' || status === 'failed') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${runId}`)
        const data = await res.json()
        setStatus(data.status)
        if (data.output_url) {
          setOutputUrl(data.output_url)
          onComplete?.(data.output_url)
        }
      } catch {
        // retry
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [runId, status, onComplete])

  if (status === 'failed') {
    return (
      <div className="text-center py-8 text-red-500">
        <div className="text-4xl mb-2">❌</div>
        <p>El workflow falló. Intentá de nuevo.</p>
      </div>
    )
  }

  if (status !== 'success' || !outputUrl) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3 animate-pulse">🎨</div>
        <p className="font-medium text-gray-700">Generando tu visual{dots}</p>
        <p className="text-sm mt-1 text-gray-400">Esto puede tomar unos segundos</p>
        <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-1.5">
          <div className="bg-purple-500 h-1.5 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-green-600 font-medium">✅ Visual generada</div>
      <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={outputUrl}
          alt="Output generado"
          width={800}
          height={800}
          className="w-full h-auto"
        />
      </div>
      <div className="text-center">
        <a
          href={outputUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
        >
          ⬇️ Descargar
        </a>
      </div>
    </div>
  )
}
