import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Harpo DPP — Urbidermis',
  description: 'Digital Product Passport · Colección HARPO · Urbidermis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
