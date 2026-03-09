/**
 * SolMint My Tokens Page
 * Design: Solana Gradient Glassmorphism
 * Shows all SPL tokens minted by the connected wallet
 */
import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { getSolscanUrl, truncateAddress } from "@/lib/solana";
import { useNetwork } from "@/contexts/NetworkContext";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Loader2, ExternalLink, Copy, CheckCircle2,
  Coins, RefreshCw, Zap
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface TokenInfo {
  mintAddress: string;
  balance: string;
  decimals: number;
  symbol?: string;
  name?: string;
  logoUri?: string;
}

export default function MyTokens() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      const tokenList: TokenInfo[] = tokenAccounts.value
        .map((account) => {
          const info = account.account.data.parsed.info;
          return {
            mintAddress: info.mint,
            balance: info.tokenAmount.uiAmountString || "0",
            decimals: info.tokenAmount.decimals,
          };
        })
        .filter((t) => parseFloat(t.balance) > 0);

      setTokens(tokenList);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      toast.error("Failed to fetch tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [connected, publicKey, connection]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#9945FF]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#14F195]/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                My Tokens
              </h1>
              <p className="text-white/40 text-sm mt-1">
                SPL tokens in your connected wallet
              </p>
            </div>
            {connected && (
              <button
                onClick={fetchTokens}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:border-white/15 text-white/60 hover:text-white text-sm font-semibold transition-all duration-200"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>

          {/* Not connected */}
          {!connected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/20 flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8 text-[#9945FF]" />
              </div>
              <h2
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Connect Your Wallet
              </h2>
              <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                Connect your Phantom, Solflare, or Backpack wallet to view all your SPL tokens.
              </p>
              <WalletMultiButton />
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-[#9945FF] animate-spin" />
              <p className="text-white/40 text-sm">Loading your tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/20 flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8 text-[#9945FF]/50" />
              </div>
              <h2
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                No Tokens Found
              </h2>
              <p className="text-white/40 text-sm mb-6">
                You don't have any SPL tokens in this wallet yet.
              </p>
              <Link href="/launch">
                <button className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto">
                  <Zap className="w-4 h-4" />
                  <span>Launch Your First Token</span>
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/30 text-sm">
                {tokens.length} token{tokens.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tokens.map((token, i) => (
                  <motion.div
                    key={token.mintAddress}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 hover:border-[#9945FF]/20 transition-all duration-300 group"
                  >
                    {/* Token header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9945FF]/30 to-[#14F195]/30 border border-[#9945FF]/20 flex items-center justify-center flex-shrink-0">
                        <Coins className="w-5 h-5 text-[#9945FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold text-white truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          SPL Token
                        </div>
                        <div className="text-xs text-white/30">
                          {token.decimals} decimals
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="mb-4">
                      <div className="text-xs text-white/30 mb-1">Balance</div>
                      <div
                        className="text-lg font-bold gradient-text"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {Number(token.balance).toLocaleString()}
                      </div>
                    </div>

                    {/* Mint address */}
                    <div className="mb-4">
                      <div className="text-xs text-white/30 mb-1">Mint Address</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/50 flex-1 truncate">
                          {truncateAddress(token.mintAddress, 8)}
                        </span>
                        <button
                          onClick={() => copyAddress(token.mintAddress)}
                          className="text-white/30 hover:text-white/60 transition-colors"
                        >
                          {copiedAddress === token.mintAddress ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action links */}
                    <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                      <a
                        href={getSolscanUrl(token.mintAddress, network)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Solscan
                      </a>
                      <a
                        href={`https://jup.ag/swap/SOL-${token.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Jupiter
                      </a>
                      <a
                        href={`https://raydium.io/liquidity/create-pool/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Raydium
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Launch another */}
              <div className="text-center pt-6">
                <Link href="/launch">
                  <button className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto">
                    <Zap className="w-4 h-4" />
                    <span>Launch Another Token</span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
