import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from '@/lib/abi'
import { PasskeyArgType } from '@safe-global/protocol-kit'
import { Safe4337Pack, SponsoredPaymasterOption } from '@safe-global/relay-kit'
import { SENTINEL_ADDRESS, SHARED_WEBAUTHN } from '@/lib/constants'
import { useCallback, useState, useEffect } from 'react'
import { Address, encodeFunctionData, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'
import { getDefaultFCLP256VerifierAddress } from '@safe-global/protocol-kit/dist/src/utils/passkeys/extractPasskeyData'

type props = {
  passkey: PasskeyArgType
  address: Address
}

export default function Application({ passkey, address }: props) {
  const [safeAddress, setSafeAddress] = useState<string>()
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>()
  const [userOp, setUserOp] = useState<string>()

  if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY) {
    throw Error('NEXT_PUBLIC_PIMLICO_API_KEY not initialized')
  }

  const BUNDLER_URL = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
  const PAYMASTER_URL = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

  const paymasterOptions = {
    isSponsored: true,
    paymasterUrl: PAYMASTER_URL
  } as SponsoredPaymasterOption

  const showSafeInfo = useCallback(async () => {


    const safe4337Pack = await Safe4337Pack.init({
      provider: baseSepolia.rpcUrls.default.http[0],
      signer: passkey,
      bundlerUrl: BUNDLER_URL,
      paymasterOptions,
      options: {
        owners: [],
        threshold: 1,
        saltNonce: '123'
      }
    })
    const safeAddress = await safe4337Pack.protocolKit.getAddress()

    const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed()

    setSafeAddress(safeAddress)
    setIsSafeDeployed(isSafeDeployed)
  }, [passkey])

  useEffect(() => {
    showSafeInfo()
  }, [showSafeInfo])

  async function handleDeploy() {
    if (!safeAddress) return
    const safe4337Pack = await Safe4337Pack.init({
      provider: baseSepolia.rpcUrls.default.http[0],
      signer: passkey,
      bundlerUrl: BUNDLER_URL,
      paymasterOptions,
      options: {
        owners: [],
        threshold: 1,
        saltNonce: '123'
      }
    })
    const verifierAddress = getDefaultFCLP256VerifierAddress(baseSepolia.id.toString())
    const txs = []
    const owners = await safe4337Pack.protocolKit.getOwners()
    console.log(owners)
    const index = owners.indexOf(SHARED_WEBAUTHN)
    const prevAddres = index == 0 ? SENTINEL_ADDRESS : owners[index - 1]
    const createSignerTx = {
      to: PASSKEY_FACTORY.networkAddresses[baseSepolia.id],
      data: encodeFunctionData({
        abi: PASSKEY_FACTORY_ABI,
        functionName: 'createSigner',
        args: [BigInt(passkey.coordinates.x), BigInt(passkey.coordinates.y), BigInt(verifierAddress)]
      }),
      value: '0'
    }
    const swapOwnerTx = {
      to: safeAddress,
      data: encodeFunctionData({
        abi: [parseAbiItem('function swapOwner(address prevOwner, address oldOwner, address newOwner)')],
        functionName: 'swapOwner',
        args: [prevAddres, owners[index], address]
      }),
      value: '0'

    }
    txs.push(createSignerTx)
    txs.push(swapOwnerTx)

    const safeOperation = await safe4337Pack.createTransaction({
      transactions: txs
    })

    console.log(safeOperation)

    const signedSafeOperation =
      await safe4337Pack.signSafeOperation(safeOperation)

    console.log(signedSafeOperation)

    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
    })


    setIsSafeDeployed(true)
    setUserOp(userOperationHash)
  }

  async function handleTx() {
    console.log(safeAddress)
    const safe4337Pack = await Safe4337Pack.init({
      provider: baseSepolia.rpcUrls.default.http[0],
      signer: passkey,
      bundlerUrl: BUNDLER_URL,
      paymasterOptions,
      options: {
        safeAddress: safeAddress!
      }
    })
    const safeOperation = await safe4337Pack.createTransaction({
      transactions: [
        {
          to: safeAddress!,
          value: '0',
          data: '0x'
        }
      ]
    })
    console.log(safeOperation)

    const signedSafeOperation =
      await safe4337Pack.signSafeOperation(safeOperation)

    console.log(signedSafeOperation)

    const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
    })


    setIsSafeDeployed(true)
    setUserOp(userOperationHash)
  }

  return (
    <>
      passkey address: {address}
      <br />
      passkey raw id: {passkey.rawId}
      <br />
      SafeAddress: {safeAddress}
      <br />
      Is Safe Deployed: {isSafeDeployed ? 'yes' : 'no'}
      <br />
      <button onClick={handleDeploy} disabled={isSafeDeployed}>
        deploy
      </button>

      <button onClick={handleTx} disabled={!isSafeDeployed}>
        transaction
      </button>
      userop: {userOp}
    </>
  )
}
