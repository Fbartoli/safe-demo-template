import { PasskeyArgType, extractPasskeyData } from '@safe-global/protocol-kit'
import { STORAGE_PASSKEY_LIST_KEY } from './constants'

export type PasskeyWithDisplay = PasskeyArgType & {
  displayName: string
}

/**
 * Create a passkey using WebAuthn API.
 * @returns {Promise<PasskeyWithDisplay>} Passkey object with rawId, coordinates, and displayName.
 * @throws {Error} If passkey creation fails.
 */
export async function createPasskey(): Promise<PasskeyWithDisplay> {
  const now = new Date()
  const displayName = `Safe Owner ${now.toLocaleDateString()} ${now.toLocaleTimeString()}` // This includes date and time
  // Generate a passkey credential using WebAuthn API
  const passkeyCredential = await navigator.credentials.create({
    publicKey: {
      pubKeyCredParams: [
        {
          // ECDSA w/ SHA-256: https://datatracker.ietf.org/doc/html/rfc8152#section-8.1
          alg: -7,
          type: 'public-key'
        }
      ],
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: 'Safe SmartAccount'
      },
      user: {
        displayName,
        id: crypto.getRandomValues(new Uint8Array(32)),
        name: displayName
      },
      timeout: 60_000,
      attestation: 'none'
    }
  }) as PublicKeyCredential

  if (!passkeyCredential) {
    throw Error('Passkey creation failed: No credential was returned.')
  }

  const passkey = await extractPasskeyData(passkeyCredential)
  return { ...passkey, displayName }
}

/**
 * Store passkey in local storage.
 * @param {PasskeyWithDisplay} passkey - Passkey object with rawId and coordinates.
 */
export function storePasskeyInLocalStorage(passkey: PasskeyWithDisplay) {
  const passkeys = loadPasskeysFromLocalStorage()
  const passkeyToStore = {
    rawId: passkey.rawId,
    coordinates: passkey.coordinates,
    displayName: passkey.displayName
  }
  passkeys.push(passkeyToStore)
  localStorage.setItem(STORAGE_PASSKEY_LIST_KEY, JSON.stringify(passkeys))
}

/**
 * Load passkeys from local storage.
 * @returns {PasskeyWithDisplay[]} List of passkeys.
 */
export function loadPasskeysFromLocalStorage(): PasskeyWithDisplay[] {
  const passkeysStored = localStorage.getItem(STORAGE_PASSKEY_LIST_KEY)
  if (!passkeysStored) return []
  
  const parsedPasskeys = JSON.parse(passkeysStored)
  return parsedPasskeys.map((passkey: any) => ({
    rawId: passkey.rawId,
    coordinates: passkey.coordinates,
    displayName: passkey.displayName,
    signerAddress: passkey.signerAddress
  }))
}

/**
 * Get passkey object from local storage.
 * @param {string} passkeyRawId - Raw ID of the passkey.
 * @returns {PasskeyWithDisplay} Passkey object.
 */
export function getPasskeyFromRawId(passkeyRawId: string): PasskeyWithDisplay {
  const passkeys = loadPasskeysFromLocalStorage()
  const passkey = passkeys.find((passkey) => passkey.rawId === passkeyRawId)!
  return passkey
}
