import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from "@/lib/abi"
import { SENTINEL_ADDRESS, SHARED_WEBAUTHN } from "@/lib/constants"
import { PasskeyWithDisplay } from "@/lib/passkey"
import { getDefaultFCLP256VerifierAddress } from "@safe-global/protocol-kit/dist/src/utils"
import { Safe4337Pack, SponsoredPaymasterOption } from "@safe-global/relay-kit"
import { useCallback, useEffect, useState } from "react"
import { Address, createPublicClient, encodeFunctionData, http, parseAbiItem } from "viem"
import { Chain } from "viem/chains"
import { toast } from "sonner"

type Props = {
  chain: Chain
  passkey: PasskeyWithDisplay
  address: Address
  safeAddress: Address
}

// Constants
const CHAIN_IDENTIFIERS: Record<number, string> = {
  11155111: 'sep',
  84532: 'basesep'
}

export default function SafeCard({ chain, passkey, address, safeAddress }: Props) {
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>(false)
  const [userOp, setUserOp] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Validate environment variables early
  if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY) {
    throw new Error('NEXT_PUBLIC_PIMLICO_API_KEY not initialized')
  }

  // Helper functions
  const getBundlerUrl = useCallback(() => {
    return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
  }, [chain.id])

  const getPaymasterOptions = useCallback((): SponsoredPaymasterOption => ({
    isSponsored: true,
    paymasterUrl: getBundlerUrl()
  }), [getBundlerUrl])

  const checkSafeDeployment = useCallback(async () => {
    try {
      const client = createPublicClient({
        chain,
        transport: http()
      })

      // Check if the address has code (is deployed)
      const code = await client.getBytecode({
        address: safeAddress
      })

      setIsSafeDeployed(code !== undefined && code !== null && code !== '0x')
    } catch (error) {
      console.error('Failed to check Safe deployment:', error)
      setIsSafeDeployed(false)
    } finally {
      setIsChecking(false)
    }
  }, [chain, safeAddress])

  // Check deployment status on mount and when chain/address changes
  useEffect(() => {
    checkSafeDeployment()
  }, [chain.id, safeAddress, checkSafeDeployment])

  const initializeSafe = useCallback(async (withSafeAddress?: boolean) => {
    return Safe4337Pack.init({
      provider: chain.rpcUrls.default.http[0],
      signer: passkey,
      bundlerUrl: getBundlerUrl(),
      paymasterOptions: getPaymasterOptions(),
      options: withSafeAddress ? {
        safeAddress,
        threshold: 1
      } : {
        owners: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
        threshold: 1,
        saltNonce: '123'
      }
    })
  }, [chain.rpcUrls.default.http, passkey, getBundlerUrl, getPaymasterOptions, safeAddress, address])

  const handleDeploy = useCallback(async () => {
    setIsLoading(true)
    try {
      const safe = await initializeSafe()
      if (!safe) throw new Error('Failed to initialize Safe')

      const verifierAddress = getDefaultFCLP256VerifierAddress(chain.id.toString())
      
      // Prepare transactions
      const createSignerTx = {
        to: PASSKEY_FACTORY.networkAddresses[chain.id.toString()],
        data: encodeFunctionData({
          abi: PASSKEY_FACTORY_ABI,
          functionName: 'createSigner',
          args: [BigInt(passkey.coordinates.x), BigInt(passkey.coordinates.y), BigInt(verifierAddress)]
        }),
        value: '0'
      }

      const owners = await safe.protocolKit.getOwners()
      const index = owners.indexOf(SHARED_WEBAUTHN)
      const prevAddress = index === 0 ? SENTINEL_ADDRESS : owners[index - 1]

      const swapOwnerTx = {
        to: safeAddress,
        data: encodeFunctionData({
          abi: [parseAbiItem('function swapOwner(address prevOwner, address oldOwner, address newOwner)')],
          functionName: 'swapOwner',
          args: [prevAddress, owners[index], address]
        }),
        value: '0'
      }

      // Create and sign operation
      const safeOperation = await safe.createTransaction({
        transactions: [createSignerTx, swapOwnerTx]
      })
      const signedOperation = await safe.signSafeOperation(safeOperation)

      // Execute transaction
      const userOperationHash = await safe.executeTransaction({
        executable: signedOperation
      })

      setIsSafeDeployed(true)
      setUserOp(userOperationHash)
      toast.success('Safe deployed successfully')
    } catch (error) {
      console.error('Failed to deploy Safe:', error)
      toast.error('Failed to deploy Safe')
    } finally {
      setIsLoading(false)
    }
  }, [chain.id, passkey, address, safeAddress, initializeSafe])

  const handleTx = useCallback(async () => {
    setIsLoading(true)
    try {
      const safe = await initializeSafe(true)
      if (!safe) throw new Error('Failed to initialize Safe')

      // Create and sign empty transaction
      const safeOperation = await safe.createTransaction({
        transactions: [{
          to: safeAddress,
          value: '0',
          data: '0x'
        }]
      })
      const signedOperation = await safe.signSafeOperation(safeOperation)

      // Execute transaction
      const userOperationHash = await safe.executeTransaction({
        executable: signedOperation
      })

      setUserOp(userOperationHash)
      toast.success('Transaction executed successfully')
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      toast.error('Failed to execute transaction')
    } finally {
      setIsLoading(false)
    }
  }, [safeAddress, initializeSafe])

  const safeLink = `https://app.safe.global/home?safe=${CHAIN_IDENTIFIERS[chain.id] || ''}:${safeAddress}`

  if (isChecking) {
    return (
      <div className="card">
        <div className="loading">Checking Safe deployment status...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="loading">Transaction in progress...</div>
      </div>
    )
  }

  return (
    <div className="card" id="cards">
      <div className="section">
        <h2>{chain.name}</h2>
        <div className="box" style={{ overflow: 'hidden', wordBreak: 'break-all' }}>
          <p className="title">Safe Details</p>
          <div style={{ marginBottom: '12px' }}>
            <p>Address:</p>
            <a 
              href={safeLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ wordBreak: 'break-all' }}
            >
              {safeAddress}
            </a>
          </div>
          <p style={{ marginBottom: '12px' }}>
            Status: <span style={{ fontWeight: 'bold' }}>{isSafeDeployed ? 'Deployed' : 'Not Deployed'}</span>
          </p>
          {userOp && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '4px' }}>Latest Operation:</p>
              <pre className="address" style={{ 
                wordBreak: 'break-all', 
                whiteSpace: 'pre-wrap',
                background: 'var(--secondary-button-background)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {userOp}
              </pre>
            </div>
          )}
          <div className="actions" style={{ gap: '8px', marginTop: '16px' }}>
            <button 
              className="primary-button" 
              onClick={handleDeploy}
              disabled={isLoading || isSafeDeployed}
            >
              Deploy
            </button>
            {isSafeDeployed && (
              <button 
                className="secondary-button" 
                onClick={handleTx}
                disabled={isLoading}
              >
                Send Test Transaction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}