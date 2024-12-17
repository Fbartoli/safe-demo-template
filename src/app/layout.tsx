import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Safe Tutorial Template',
  description: 'Repository used as as template to build Safe demo applications.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
