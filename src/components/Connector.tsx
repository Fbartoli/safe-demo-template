"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function Connector() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "160px"
          }}
        >
          {address}
        </span>
        <button
          onClick={() => disconnect()}
          className="secondary-button"
          style={{
            padding: "4px 12px",
            fontSize: "14px",
            height: "auto",
            minHeight: "32px"
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="primary-button"
      style={{
        padding: "4px 12px",
        fontSize: "14px",
        height: "auto",
        minHeight: "32px"
      }}
    >
      Connect Wallet
    </button>
  );
}