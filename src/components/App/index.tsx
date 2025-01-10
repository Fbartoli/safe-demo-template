import { PasskeyWithDisplay } from '@/lib/passkey'
import { Safe4337Pack, SponsoredPaymasterOption } from '@safe-global/relay-kit'
import { useCallback, useState, useEffect } from 'react'
import { Address, Chain } from 'viem'
import { baseSepolia, sepolia } from 'viem/chains'
import SafeCard from './safeCard'
import { toast } from 'sonner'

type Props = {
  passkey: PasskeyWithDisplay
  address: Address
}

// Constants
const SUPPORTED_CHAINS: Chain[] = [baseSepolia, sepolia]
const SAFE_OWNERS: Address[] = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
const SAFE_CONFIG = {
  threshold: 1,
  saltNonce: '123'
} as const

export default function Application({ passkey, address }: Props) {
  const [safeAddress, setSafeAddress] = useState<Address>()
  const [isLoading, setIsLoading] = useState(false)

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

  const initializeSafe = useCallback(async (chain: Chain) => {
    return Safe4337Pack.init({
      provider: chain.rpcUrls.default.http[0],
      signer: passkey,
      bundlerUrl: getBundlerUrl(chain.id),
      paymasterOptions: getPaymasterOptions(chain.id),
      options: {
        owners: SAFE_OWNERS,
        threshold: SAFE_CONFIG.threshold,
        saltNonce: SAFE_CONFIG.saltNonce
      }
    })
  }, [passkey, getBundlerUrl, getPaymasterOptions])

  const showSafeInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const counterFactualSafe = await initializeSafe(baseSepolia)
      const address = await counterFactualSafe.protocolKit.getAddress()
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
  if (!safeAddress) {
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
    <div className="grid" id="grids">
      {SUPPORTED_CHAINS.map((chain) => (
        <SafeCard
          key={chain.id}
          chain={chain}
          passkey={passkey}
          address={address}
          safeAddress={safeAddress}
        />
      ))}
    </div>
  )
}
