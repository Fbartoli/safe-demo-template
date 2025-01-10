'use client'

import Application from '@/components/App'
import PasskeyManager from '@/components/PasskeyManager'
import { PasskeyWithDisplay } from '@/lib/passkey'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Address, createPublicClient, getContract, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { Toaster, toast } from 'sonner'
import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from '@/lib/abi'
import { getDefaultFCLP256VerifierAddress } from '@safe-global/protocol-kit/dist/src/utils/passkeys/extractPasskeyData'

const queryClient = new QueryClient()

export default function Home() {
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyWithDisplay>()
  const [address, setAddress] = useState<Address>()

  const handleSelectPasskey = async (passkey: PasskeyWithDisplay) => {
    try {
      const passkeyContract = getContract({
        address: PASSKEY_FACTORY.networkAddresses[84532],
        abi: PASSKEY_FACTORY_ABI,
        client: createPublicClient({
          chain: baseSepolia,
          transport: http()
        })
      })
      
      const verifierAddress = getDefaultFCLP256VerifierAddress(baseSepolia.id.toString())
      const signerAddress = await passkeyContract.read.getSigner([
        BigInt(passkey.coordinates.x), 
        BigInt(passkey.coordinates.y), 
        BigInt(verifierAddress)
      ])
      
      setAddress(signerAddress)
      setSelectedPasskey(passkey)
      toast.success('Passkey selected successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to select passkey')
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <main>
        <h1>Safe Kiln demo</h1>
        <PasskeyManager 
          onSelectPasskey={handleSelectPasskey}
          selectedPasskey={selectedPasskey}
        />
        {selectedPasskey && address && (
          <Application passkey={selectedPasskey} address={address} />
        )}
      </main>
    </QueryClientProvider>
  )
}
