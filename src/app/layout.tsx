import '@/styles/globals.css'
import type { Metadata } from 'next'
import { getConfig } from "@/lib/clients";
import { cookieToInitialState } from 'wagmi';
import { Providers } from './Provider';
import { headers } from "next/headers";
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Safe Demo Template',
  description: 'Template repository for Safe demo applications.',
  icons: {
    icon: '/images/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    // @ts-ignore
    headers().get("cookie"),
  );
  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  )
}
