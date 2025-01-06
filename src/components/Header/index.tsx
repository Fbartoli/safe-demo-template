import styles from './page.module.css'

type props = {
  handleCreatePasskey: () => {}
}

export default function Header({ handleCreatePasskey }: props) {

  return (
    <header>
      <h2>{'Safe{DEMO}'}</h2>
      {(
        <button onClick={handleCreatePasskey} className={styles.connectButton}>
          Connect with passkey
        </button>
      )}
    </header>
  )
}
