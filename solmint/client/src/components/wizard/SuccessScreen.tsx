/**
 * SolMint Success Screen
 * Design: Solana Gradient Glassmorphism
 * Beautiful success screen after token deployment
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, ExternalLink, Twitter, CheckCircle2, Rocket } from "lucide-react";
import { getSolscanUrl } from "@/lib/solana";
import { useNetwork } from "@/contexts/NetworkContext";
import { useTokenForm } from "@/contexts/TokenFormContext";
import { Link } from "wouter";
import { toast } from "sonner";

interface Props {
  mintAddress: string;
  onLaunchAnother: () => void;
}

export default function SuccessScreen({ mintAddress, onLaunchAnother }: Props) {
  const { network } = useNetwork();
  const { formData } = useTokenForm();
  const [copied, setCopied] = useState(false);

  const solscanUrl = getSolscanUrl(mintAddress, network);

  const copyAddress = () => {
    navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    toast.success("Mint address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetText = encodeURIComponent(
    `I just launched $${formData.symbol} on Solana using SolMint! 🚀\n\nMint: ${mintAddress}\n\n#Solana #SPLToken #SolMint`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663415226055/LzMakPG2aGmUsNJZz8vb24/solmint-success-bg-JoKNmfj8iGARypjwWhgx48.webp)` }}
        />
      </div>

      <div className="space-y-6 py-4">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-[0_0_60px_rgba(20,241,149,0.4)]">
            <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2
              className="text-3xl font-bold text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Token Launched! 🚀
            </h2>
            <p className="text-white/50">
              <span className="gradient-text font-bold">${formData.symbol}</span> is now live on Solana
            </p>
          </div>
        </motion.div>

        {/* Token info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-purple p-5 space-y-4"
        >
          <div className="flex items-center gap-4">
            {formData.logoPreviewUrl && (
              <img
                src={formData.logoPreviewUrl}
                alt="Token logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#9945FF]/30"
              />
            )}
            <div>
              <div className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formData.name}
              </div>
              <div className="text-[#9945FF] font-semibold">${formData.symbol}</div>
            </div>
          </div>

          {/* Mint address */}
          <div className="space-y-1.5">
            <div className="text-xs text-white/30 uppercase tracking-wider">Mint Address</div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10">
              <span className="font-mono text-xs text-white/80 flex-1 break-all">
                {mintAddress}
              </span>
              <button
                onClick={copyAddress}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
                ) : (
                  <Copy className="w-4 h-4 text-white/40" />
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div className="text-center">
              <div className="text-xs text-white/30 mb-1">Supply</div>
              <div className="text-sm font-bold text-white font-mono">
                {Number(formData.supply).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/30 mb-1">Decimals</div>
              <div className="text-sm font-bold text-white">{formData.decimals}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/30 mb-1">Mint Auth</div>
              <div className="text-sm font-bold text-[#14F195]">
                {formData.revokeMintAuthority ? "Revoked" : "Active"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card hover:border-[#9945FF]/30 transition-all duration-200 text-sm font-semibold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <ExternalLink className="w-4 h-4 text-[#9945FF]" />
            View on Solscan
          </a>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 transition-all duration-200 text-sm font-semibold text-[#1DA1F2]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </a>
        </motion.div>

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 space-y-2"
        >
          <div className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What's next?
          </div>
          {[
            { label: "Add liquidity on Raydium", url: `https://raydium.io/liquidity/create-pool/` },
            { label: "Trade on Jupiter", url: `https://jup.ag/` },
            { label: "List on DEXScreener", url: `https://dexscreener.com/` },
          ].map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                {item.label}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-[#9945FF] transition-colors" />
            </a>
          ))}
        </motion.div>

        {/* Launch another */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onLaunchAnother}
          className="w-full py-3 rounded-xl border border-white/10 hover:border-[#9945FF]/30 text-white/60 hover:text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Rocket className="w-4 h-4" />
          Launch Another Token
        </motion.button>
      </div>
    </div>
  );
}
