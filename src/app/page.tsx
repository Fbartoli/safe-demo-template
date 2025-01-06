'use client'

import Application from '@/components/App'
import Components from '@/components/App/components'
import Header from '@/components/Header'
import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from '@/lib/abi'
import { VERIFIER_ADDRESS } from '@/lib/constants'
import { createPasskey, storePasskeyInLocalStorage } from '@/lib/passkey'
import '@rainbow-me/rainbowkit/styles.css'
import { PasskeyArgType } from '@safe-global/protocol-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Address, createPublicClient, getContract, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const queryClient = new QueryClient()

export default function Home() {
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyArgType>()
  const [address, setAddress] = useState<Address>()




  async function handleCreatePasskey() {
    const passkey = await createPasskey()

    const passkeyContract = getContract({
      address: PASSKEY_FACTORY.networkAddresses[84532],
      abi: PASSKEY_FACTORY_ABI,
      client: createPublicClient({
        chain: baseSepolia,
        transport: http()
      })
    })
    const signerAddress = await passkeyContract.read.getSigner([BigInt(passkey.coordinates.x), BigInt(passkey.coordinates.y), BigInt(VERIFIER_ADDRESS)])
    console.log(signerAddress)
    setAddress(signerAddress)
    storePasskeyInLocalStorage(passkey)
    setSelectedPasskey(passkey)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Header
        handleCreatePasskey={handleCreatePasskey}
      />
      <main>
        <h1>Safe passkey demo</h1>
        <a
          href="https://github.com/5afe/safe-demo-template"
          target="_blank"
        >
          GitHub Repository
        </a>
        <a href="https://docs.safe.global" target="_blank">
          Safe Developer Documentation
        </a>
        {selectedPasskey && address ? <Application passkey={selectedPasskey} address={address} />: null}
        <Components />
      </main>
    </QueryClientProvider>
  )
}
