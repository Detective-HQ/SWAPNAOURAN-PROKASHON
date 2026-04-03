import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair',
  display: 'swap'
});

const sourceSans = Source_Sans_3({ 
  subsets: ["latin"], 
  variable: '--font-source-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Swapno Uran Prakashan | Curator of Stories',
  description: 'A premium destination for physical and digital books with a bold botanical aesthetic. Discover stories that matter.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${sourceSans.variable} font-body antialiased selection:bg-botanical-terracotta/30 selection:text-botanical-forest`}>
        <ClerkProvider>
          {/* Mandatory Paper Grain Overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
