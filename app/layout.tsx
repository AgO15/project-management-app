import type { Metadata } from 'next'
import { Roboto_Mono } from 'next/font/google' // 1. Importar Roboto Mono
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthListener } from '@/components/AuthListener'
import './globals.css'

// 2. Instanciar la fuente (eliminamos Geist y Rubik)
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-mono', // 3. Asignar el nombre de la variable
})

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark"> {/* Opcional: forzar dark mode */}
      {/* 4. Aplicar la variable al body */}
      <body className={`font-mono ${robotoMono.variable}`}>
        <AuthListener />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}