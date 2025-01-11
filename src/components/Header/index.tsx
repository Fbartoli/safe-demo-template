import { Connector } from "../Connector";

export default function Header() {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--background-color)'
    }}>
      <h2 style={{ margin: 0 }}>{'Safe{DEMO}'}</h2>
      <Connector />
    </header>
  )
}
