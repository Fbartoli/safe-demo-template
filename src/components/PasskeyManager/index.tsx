import { PasskeyArgType } from '@safe-global/protocol-kit'
import { loadPasskeysFromLocalStorage, createPasskey, PasskeyWithDisplay } from '@/lib/passkey'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PASSKEY_FACTORY, PASSKEY_FACTORY_ABI } from '@/lib/abi'
import { createPublicClient, getContract, http, Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { getDefaultFCLP256VerifierAddress } from '@safe-global/protocol-kit/dist/src/utils'

type Props = {
  onSelectPasskey: (passkey: PasskeyWithDisplay) => void
  selectedPasskey?: PasskeyWithDisplay
}

type PasskeyWithSigner = PasskeyWithDisplay & {
  signerAddress?: Address
}

export default function PasskeyManager({ onSelectPasskey, selectedPasskey }: Props) {
  const [passkeys, setPasskeys] = useState<PasskeyWithSigner[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const getSignerAddress = async (passkey: PasskeyWithDisplay) => {
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
    
    return signerAddress
  }

  useEffect(() => {
    const loadPasskeysWithSigners = async () => {
      const storedPasskeys = loadPasskeysFromLocalStorage()
      console.log('passkeysWithSigners', storedPasskeys)
      setPasskeys(storedPasskeys)
    }

    loadPasskeysWithSigners()
    console.log('passkeys', passkeys)
  }, [])

  const handleCreatePasskey = async () => {
    setIsCreating(true)
    try {
      const passkey = await createPasskey()
      toast.success('Passkey created successfully')

      const signerAddress = await getSignerAddress(passkey)
      const passkeyWithSigner = { ...passkey, signerAddress }
      
      const storedPasskeys = loadPasskeysFromLocalStorage()
      storedPasskeys.push(passkeyWithSigner)
      console.log('storedPasskeys', storedPasskeys)
      localStorage.setItem('safe_passkey_list', JSON.stringify(storedPasskeys))
      setPasskeys([...passkeys, passkeyWithSigner])
      onSelectPasskey(passkey)
      toast.success('Passkey created and selected successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create passkey')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeletePasskey = (passkey: PasskeyWithSigner) => {
    const updatedPasskeys = passkeys.filter(p => p.rawId !== passkey.rawId)
    const passkeysToStore = updatedPasskeys.map(p => ({
      rawId: p.rawId,
      coordinates: p.coordinates,
      displayName: p.displayName
    }))
    localStorage.setItem('safe_passkey_list', JSON.stringify(passkeysToStore))
    setPasskeys(updatedPasskeys)
    toast.success('Passkey deleted successfully')
  }

  if (passkeys.length === 0) {
    return (
      <div className="card">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <p>No passkeys found. Create one to get started.</p>
          <div className="actions">
            <button 
              className="primary-button"
              onClick={handleCreatePasskey}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create new passkey'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Your Passkeys</h2>
        <div className="actions">
          <button 
            className="primary-button"
            onClick={handleCreatePasskey}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create new passkey'}
          </button>
        </div>
      </div>
      <div className="section">
        <div>
          {passkeys.map((passkey, index) => (
            <div key={passkey.rawId} className="box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <p className="title">{passkey.displayName}</p>
                  <pre className="address">ID: {passkey.rawId}</pre>
                  {passkey.signerAddress && (
                    <pre className="address">Signer: {passkey.signerAddress}</pre>
                  )}
                </div>
                <div className="actions">
                  <button
                    className={selectedPasskey?.rawId === passkey.rawId ? 'primary-button' : 'secondary-button'}
                    onClick={() => onSelectPasskey(passkey)}
                  >
                    {selectedPasskey?.rawId === passkey.rawId ? 'Selected' : 'Select'}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => handleDeletePasskey(passkey)}
                    style={{ borderColor: 'var(--error-note-background)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 