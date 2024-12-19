'use client'

import Application from '@/components/App'
import Header from '@/components/Header'
import { supportedChains } from '@/lib/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

if (!process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID) {
  throw Error('NEXT_PUBLIC_WAGMI_PROJECT_ID not initialized')
}

const wagmiConfig = getDefaultConfig({
  appName: 'Safe Demo Template',
  projectId: process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID,
  chains: supportedChains as any,
  ssr: true
})

export default function Home() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Header />
          <main>
            <h1>Application Title</h1>
            <a
              href="https://github.com/5afe/safe-demo-template"
              target="_blank"
            >
              GitHub Repository
            </a>
            <a href="https://docs.safe.global" target="_blank">
              Safe Developer Documentation
            </a>
            <Application />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
