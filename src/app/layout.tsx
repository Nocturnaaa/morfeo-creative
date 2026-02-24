import type { Metadata } from 'next'
import { Instrument_Serif, DM_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Morfeo Creative',
  description: 'AI Visual Studio para agencias de marketing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${instrumentSerif.variable} ${dmMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
