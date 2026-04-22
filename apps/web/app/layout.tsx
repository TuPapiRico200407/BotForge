import '../styles/globals.css'
import type { Metadata } from 'next'

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'BotForge',
  description: 'Plataforma Web/App Multi-Bot para WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
