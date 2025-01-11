import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from "@/lib/abi"
import { getDefaultFCLP256VerifierAddress } from "@safe-global/protocol-kit/dist/src/utils"
import { Safe4337Pack, SponsoredPaymasterOption } from "@safe-global/relay-kit"
import { useCallback, useEffect, useState } from "react"
import { Address, createPublicClient, encodeFunctionData, http, parseAbiItem, Transaction } from "viem"
import { Chain } from "viem/chains"
import { toast } from "sonner"
import { PasskeyWithSigner } from "../PasskeyManager"
import { Eip1193Provider } from "@safe-global/protocol-kit"
import { useWalletClient } from "wagmi"
import { SENTINEL_ADDRESS } from "@/lib/constants"
import { SHARED_WEBAUTHN } from "@/lib/constants"
import { SAFE_CONFIG } from "./index"

type Props = {
  chain: Chain
  passkey: PasskeyWithSigner
  address: Address
  safeAddress: Address
  withPasskey: boolean
}

// Constants
const CHAIN_IDENTIFIERS: Record<number, string> = {
  11155111: 'sep',
  84532: 'basesep'
}

export default function SafeCard({ chain, passkey, address, safeAddress, withPasskey }: Props) {
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>(false)
  const [userOp, setUserOp] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const walletClient = useWalletClient();

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
    if (!withPasskey) {
      const providerChainId = walletClient.data!.chain.id;
      if (providerChainId !== chain.id) {
        await walletClient.data!.switchChain({ id: chain.id })
      }
    }
    console.log('initializeSafe', withPasskey, withSafeAddress, chain.rpcUrls.default.http[0], passkey, walletClient.data!.account.address)
    return Safe4337Pack.init({
      provider: withPasskey ? chain.rpcUrls.default.http[0] : walletClient.data! as Eip1193Provider,
      signer: withPasskey ? passkey : walletClient.data!.account.address,
      bundlerUrl: getBundlerUrl(),
      paymasterOptions: getPaymasterOptions(),
      options: withSafeAddress ? {
        safeAddress,
      } : {
        owners: [address],
        threshold: SAFE_CONFIG.threshold,
        saltNonce: SAFE_CONFIG.saltNonce
      }
    })
  }, [chain.rpcUrls.default.http, passkey, getBundlerUrl, getPaymasterOptions, safeAddress, address])

  const handleDeploy = useCallback(async () => {
    setIsLoading(true)
    const transactions = []
    try {
      const safe = await initializeSafe(false)
      if (!safe) throw new Error('Failed to initialize Safe')
      console.log('safe', await safe.protocolKit.getAddress())
      console.log('safe Owners', await safe.protocolKit.getOwners())

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
      transactions.push(createSignerTx)

      if (!withPasskey) {
        const addOwnerTx = {
          to: safeAddress,
          data: encodeFunctionData({
            abi: [parseAbiItem('function addOwnerWithThreshold(address owner, uint256 _threshold)')],
            functionName: 'addOwnerWithThreshold',
            args: [passkey.signerAddress, BigInt(1)]
          }),
          value: '0'
        }
        transactions.push(addOwnerTx)
      } else {
        const owners = await safe.protocolKit.getOwners()
        const index = owners.indexOf(SHARED_WEBAUTHN)
        const prevAddress = index === 0 ? SENTINEL_ADDRESS : owners[index - 1]

        const swapOwnerTx = {
          to: safeAddress,
          data: encodeFunctionData({
            abi: [parseAbiItem('function swapOwner(address prevOwner, address oldOwner, address newOwner)')],
            functionName: 'swapOwner',
            args: [prevAddress, owners[index], passkey.signerAddress]
          }),
          value: '0'
        }
        transactions.push(swapOwnerTx)
      }


      // Create and sign operation
      const safeOperation = await safe.createTransaction({
        transactions
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
        <div className="box" style={{ overflow: 'hidden', wordBreak: 'break-all' }}>
          <p className="title">Safe Details</p>
          <h2>Chain: {chain.name}</h2>

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
              onClick={() => handleDeploy()}
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