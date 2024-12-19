import { useConnectModal } from '@rainbow-me/rainbowkit'
import makeBlockie from 'ethereum-blockies-base64'
import { useAccount, useDisconnect } from 'wagmi'
import styles from './page.module.css'

export default function Header() {
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()
  const { address: connectedAddress } = useAccount()
  
  return (
    <header>
      <h2>{'Safe{DEMO}'}</h2>
      {!connectedAddress ? (
        <button onClick={openConnectModal} className={styles.connectButton}>Connect Wallet</button>
      ) : (
        <div>
          <div className="address">
            <img
              className="blockie"
              src={makeBlockie(connectedAddress)}
            />
            <pre>{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}</pre>
          </div>
          <button onClick={() => disconnect()} className={styles.connectButton}>Disconnect</button>
        </div>
      )}
    </header>
  )
}
