import { PasskeyArgType } from '@safe-global/protocol-kit'
import { SafeProvider, createConfig } from '@safe-global/safe-react-hooks'
import { Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import UserOps from './sendUserOps'

type props = {
  passkey: PasskeyArgType
  address: Address
}

export default function Application({passkey, address}: props) {

  if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY) {
   throw Error('NEXT_PUBLIC_PIMLICO_API_KEY not initialized')
  }

  const BUNDLER_URL = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
  const PAYMASTER_URL = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

  const safeConfig = createConfig({
    chain: baseSepolia,
    provider: baseSepolia.rpcUrls.default.http[0],
    signer: passkey,
    safeOptions: {
      owners: ['0x94a4F6affBd8975951142c3999aEAB7ecee555c2'],
      threshold: 1,
      saltNonce: '123'
    },
    safeOperationOptions: {
     isSponsored: true,
     bundlerUrl: BUNDLER_URL,
     paymasterUrl: PAYMASTER_URL
    }
  })

  return (
     <SafeProvider config={safeConfig}>
       passkey address: {address}
      <br />
      passkey raw id: {passkey.rawId}
      <UserOps/>
     
    </SafeProvider>
  )
}
