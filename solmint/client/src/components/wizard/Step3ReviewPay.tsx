/**
 * SolMint Wizard Step 3 — Review & Pay
 * Design: Solana Gradient Glassmorphism
 * - Full summary card
 * - Live SOL price from CoinGecko
 * - Fee wallet transparency
 * - Confirmation checkbox
 * - Deploy button
 */
import { useState, useEffect } from "react";
import { useTokenForm } from "@/contexts/TokenFormContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { getSolPrice, FEE_WALLET_ADDRESS, truncateAddress } from "@/lib/solana";
import { useNetwork } from "@/contexts/NetworkContext";
import {
  AlertTriangle, CheckCircle2, Rocket, ExternalLink,
  Globe, Twitter, Send, Shield, Loader2
} from "lucide-react";

interface Step3Props {
  onDeploy: () => void;
  isDeploying: boolean;
}

export default function Step3ReviewPay({ onDeploy, isDeploying }: Step3Props) {
  const { formData } = useTokenForm();
  const { connected, publicKey } = useWallet();
  const { isDevnet } = useNetwork();
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getSolPrice().then(setSolPrice);
  }, []);

  const feeUsd = solPrice ? (0.1 * solPrice).toFixed(2) : null;

  const isValid =
    formData.name.trim() &&
    formData.symbol.trim() &&
    formData.supply &&
    Number(formData.supply) > 0 &&
    confirmed &&
    connected;

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Review & Deploy
        </h2>
        <p className="text-white/40 text-sm">
          Confirm your token details before paying and deploying on-chain.
        </p>
      </div>

      {/* Devnet warning */}
      {isDevnet && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-400">Devnet Mode Active</div>
            <div className="text-xs text-amber-400/70 mt-0.5">
              This will deploy to Devnet (test network). Switch to Mainnet in the navbar when ready for real deployment.
            </div>
          </div>
        </div>
      )}

      {/* Token Summary Card */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#9945FF]/30 to-[#14F195]/30 border-2 border-[#9945FF]/30 flex items-center justify-center flex-shrink-0">
            {formData.logoPreviewUrl ? (
              <img src={formData.logoPreviewUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formData.symbol[0] || "?"}
              </span>
            )}
          </div>
          <div>
            <div className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {formData.name || "—"}
            </div>
            <div className="text-[#9945FF] font-semibold">${formData.symbol || "—"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
          <div>
            <div className="text-xs text-white/30 mb-1">Total Supply</div>
            <div className="text-sm font-semibold text-white font-mono">
              {Number(formData.supply || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-1">Decimals</div>
            <div className="text-sm font-semibold text-white">{formData.decimals}</div>
          </div>
          {formData.description && (
            <div className="col-span-2">
              <div className="text-xs text-white/30 mb-1">Description</div>
              <div className="text-sm text-white/70">{formData.description}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-white/30 mb-1">Mint Authority</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              {formData.revokeMintAuthority ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                  <span className="text-[#14F195]">Will be revoked</span>
                </>
              ) : (
                <span className="text-amber-400">Retained by you</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/30 mb-1">Logo on IPFS</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              {formData.logoIpfsUri ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                  <span className="text-[#14F195]">Uploaded</span>
                </>
              ) : (
                <span className="text-white/40">No logo</span>
              )}
            </div>
          </div>
        </div>

        {/* Social links */}
        {(formData.websiteUrl || formData.twitterUrl || formData.telegramUrl) && (
          <div className="border-t border-white/5 pt-3 flex flex-wrap gap-3">
            {formData.websiteUrl && (
              <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                <Globe className="w-3 h-3" /> Website
              </a>
            )}
            {formData.twitterUrl && (
              <a href={formData.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                <Twitter className="w-3 h-3" /> Twitter
              </a>
            )}
            {formData.telegramUrl && (
              <a href={formData.telegramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                <Send className="w-3 h-3" /> Telegram
              </a>
            )}
          </div>
        )}
      </div>

      {/* Fee Display */}
      <div className="glass-card-purple p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Platform Fee</span>
          <div className="text-right">
            <div className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              0.1 SOL
            </div>
            {feeUsd && (
              <div className="text-xs text-white/40">≈ ${feeUsd} USD</div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-white/40 text-xs">Network fees</span>
          <span className="text-white/40 text-xs">~0.01 SOL</span>
        </div>
        <div className="flex items-start gap-2 pt-1">
          <Shield className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/30">
            Fee recipient:{" "}
            <span className="font-mono text-white/50">
              {truncateAddress(FEE_WALLET_ADDRESS, 6)}
            </span>
            {" "}
            <a
              href={`https://solscan.io/account/${FEE_WALLET_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9945FF]/60 hover:text-[#9945FF] inline-flex items-center gap-0.5"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setConfirmed(!confirmed)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
            confirmed
              ? "bg-[#9945FF] border-[#9945FF]"
              : "bg-transparent border-white/30 hover:border-[#9945FF]/50"
          }`}
        >
          {confirmed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <span className="text-sm text-white/60 leading-relaxed">
          I confirm this token deployment is{" "}
          <span className="text-white font-semibold">irreversible</span>. I understand the 0.1 SOL fee is non-refundable and will be sent before token creation begins.
        </span>
      </div>

      {/* Deploy Button */}
      {!connected ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">Connect your wallet to deploy</span>
        </div>
      ) : (
        <button
          onClick={onDeploy}
          disabled={!isValid || isDeploying}
          className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            isValid && !isDeploying
              ? "btn-gradient shadow-[0_0_40px_rgba(153,69,255,0.3)] hover:shadow-[0_0_60px_rgba(153,69,255,0.5)]"
              : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              <span>Deploy Token — Pay 0.1 SOL</span>
            </>
          )}
        </button>
      )}

      {!confirmed && connected && (
        <p className="text-center text-xs text-white/30">
          Check the confirmation box above to enable deployment
        </p>
      )}
    </div>
  );
}
