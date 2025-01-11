import { PasskeyWithDisplay } from '@/lib/passkey'
import { Safe4337Pack, SponsoredPaymasterOption } from '@safe-global/relay-kit'
import { useCallback, useState, useEffect } from 'react'
import { Address, Chain } from 'viem'
import { baseSepolia, sepolia } from 'viem/chains'
import { toast } from 'sonner'
import { PasskeyWithSigner } from '../PasskeyManager'
import { useWalletClient } from 'wagmi'
import { Eip1193Provider } from '@safe-global/protocol-kit'
import SafeCard from './safeCard'

type Props = {
  passkey: PasskeyWithSigner
  address: Address
}

// Constants
const SUPPORTED_CHAINS: Chain[] = [baseSepolia, sepolia]
export const SAFE_CONFIG = {
  threshold: 1,
  saltNonce: '1233'
} as const

export default function Application({ passkey, address }: Props) {
  const [safeAddress, setSafeAddress] = useState<Address>()
  const [safePasskeyAddress, setSafePasskeyAddress] = useState<Address>()
  const [isLoading, setIsLoading] = useState(false)
  const walletClient = useWalletClient();

  // Validate environment variables early
  if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY) {
    throw new Error('NEXT_PUBLIC_PIMLICO_API_KEY not initialized')
  }

  // Helper functions
  const getBundlerUrl = useCallback((chainId: number) => {
    return `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
  }, [])

  const getPaymasterOptions = useCallback((chainId: number): SponsoredPaymasterOption => ({
    isSponsored: true,
    paymasterUrl: getBundlerUrl(chainId)
  }), [getBundlerUrl])

  const initializeSafe = useCallback(async (chain: Chain, withPasskey?: boolean) => {
    const data = await Safe4337Pack.init({
      provider: withPasskey ? chain.rpcUrls.default.http[0] : walletClient.data! as Eip1193Provider,
      signer: withPasskey ? passkey : walletClient.data!.account.address,
      bundlerUrl: getBundlerUrl(chain.id),
      paymasterOptions: getPaymasterOptions(chain.id),
      options: {
        owners: [address],
        threshold: SAFE_CONFIG.threshold,
        saltNonce: SAFE_CONFIG.saltNonce
      }
    })
    return data
  }, [getBundlerUrl, getPaymasterOptions])

  const showSafeInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const counterFactualSafe = await initializeSafe(baseSepolia)
      const address = await counterFactualSafe.protocolKit.getAddress()
      const counterFactualSafePasskey = await initializeSafe(baseSepolia, true)
      const safePasskeyAddress = await counterFactualSafePasskey.protocolKit.getAddress()
      setSafePasskeyAddress(safePasskeyAddress)
      setSafeAddress(address)
      toast.success('Safe address generated successfully')
    } catch (error) {
      console.error('Failed to initialize Safe:', error)
      toast.error('Failed to generate Safe address')
    } finally {
      setIsLoading(false)
    }
  }, [initializeSafe])

  // Effects
  useEffect(() => {
    showSafeInfo()
  }, [showSafeInfo])

  // Loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="loading">Generating Safe address...</div>
      </div>
    )
  }

  // Error state
  if (!safeAddress || !safePasskeyAddress) {
    return (
      <div className="card">
        <div className="callout-warning">
          <p>No Safe address generated. Please check your configuration and try again.</p>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <>
      <div className='card'>
        Deployer: EOA
        <div className="grid" id="grids">
          {SUPPORTED_CHAINS.map((chain) => (
            <SafeCard
              key={chain.id}
              chain={chain}
              passkey={passkey}
              address={address}
              safeAddress={safeAddress}
              withPasskey={false}
            />
          ))}
        </div>
      </div>
      <div className='card'>
        Deployer: Passkey 
        <div className="grid" id="grids">
          {SUPPORTED_CHAINS.map((chain) => (
            <SafeCard
              key={chain.id}
              chain={chain}
              passkey={passkey}
              address={address}
              safeAddress={safePasskeyAddress}
              withPasskey={true}
            />
          ))}
        </div>
      </div>
    </>
  )
}
