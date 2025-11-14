import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Rubik } from 'next/font/google' // 1. Importar Rubik
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthListener } from '@/components/AuthListener'
import './globals.css'

// 2. Instanciar la fuente Rubik
const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-rubik', // Este es el nombre de la variable CSS
})

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* 3. Añadir la variable de Rubik a la clase del body */}
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${rubik.variable}`}>
        <AuthListener />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}