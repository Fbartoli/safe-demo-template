'use client'

import Application from '@/components/App'
import PasskeyManager, { PasskeyWithSigner } from '@/components/PasskeyManager'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import Header from '@/components/Header'
import { useAccount, useWalletClient } from 'wagmi'

export default function Home() {
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyWithSigner>()
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient(); //pre-fetch wallet client

  const handleSelectPasskey = async (passkey: PasskeyWithSigner) => {
    try {
      setSelectedPasskey(passkey)
      toast.success('Passkey selected successfully')

    } catch (err) {
      console.error(err)
      toast.error('Failed to select passkey')
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <Header />
      <main>
        <h1>Safe Kiln demo</h1>
        <PasskeyManager
          onSelectPasskey={handleSelectPasskey}
          selectedPasskey={selectedPasskey}
        />
        {selectedPasskey && address && isConnected && (
          <Application passkey={selectedPasskey} address={address} />
        )}
        {/* <Components /> */}
      </main>
    </>
  )
}