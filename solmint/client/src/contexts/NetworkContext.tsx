/**
 * SolMint NetworkContext
 * Design: Solana Gradient Glassmorphism
 * Manages devnet/mainnet toggle state
 */
import { createContext, useContext, useState } from "react";
import { clusterApiUrl } from "@solana/web3.js";

export type Network = "mainnet-beta" | "devnet";

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  endpoint: string;
  isDevnet: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "devnet",
  setNetwork: () => {},
  endpoint: clusterApiUrl("devnet"),
  isDevnet: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>("devnet");

  const endpoint =
    network === "devnet"
      ? clusterApiUrl("devnet")
      : (import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl("mainnet-beta"));

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
        endpoint,
        isDevnet: network === "devnet",
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
