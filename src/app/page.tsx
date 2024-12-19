'use client'

import Application from '@/components/App'
import Header from '@/components/Header'
import {
  RainbowKitProvider,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const queryClient = new QueryClient()

const wagmiConfig = getDefaultConfig({
  appName: 'Safe Tutorial Template',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia],
  ssr: true
})

export default function Home() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Header />
          <Application />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
