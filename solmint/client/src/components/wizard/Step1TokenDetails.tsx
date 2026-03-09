/**
 * SolMint Wizard Step 1 — Token Details
 * Design: Solana Gradient Glassmorphism
 */
import { useTokenForm } from "@/contexts/TokenFormContext";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Step1TokenDetails() {
  const { formData, updateFormData } = useTokenForm();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Token Details
        </h2>
        <p className="text-white/40 text-sm">Define the core properties of your SPL token.</p>
      </div>

      {/* Token Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
          Token Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            updateFormData({ name: e.target.value.slice(0, 32) })
          }
          placeholder="e.g. My Awesome Token"
          maxLength={32}
          className="sol-input w-full px-4 py-3 text-white"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>The full name of your token</span>
          <span>{formData.name.length}/32</span>
        </div>
      </div>

      {/* Token Symbol */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
          Token Symbol <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) =>
            updateFormData({ symbol: e.target.value.toUpperCase().slice(0, 10) })
          }
          placeholder="e.g. MAT"
          maxLength={10}
          className="sol-input w-full px-4 py-3 text-white uppercase tracking-widest font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>Auto-uppercased ticker symbol</span>
          <span>{formData.symbol.length}/10</span>
        </div>
      </div>

      {/* Decimals + Supply row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Decimals */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
            Decimals
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-white/30 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-[#1a1a2e] border-[#9945FF]/30 text-white text-xs">
                Decimals define divisibility. 9 decimals (like SOL) means 1 token = 1,000,000,000 smallest units.
                Use 0 for NFT-like tokens. Most meme coins use 6 or 9.
              </TooltipContent>
            </Tooltip>
          </label>
          <input
            type="number"
            value={formData.decimals}
            onChange={(e) => {
              const v = Math.min(9, Math.max(0, parseInt(e.target.value) || 0));
              updateFormData({ decimals: v });
            }}
            min={0}
            max={9}
            className="sol-input w-full px-4 py-3 text-white"
          />
          <div className="text-xs text-white/30">Range: 0–9 (default: 9)</div>
        </div>

        {/* Total Supply */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
            Total Supply <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.supply}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              updateFormData({ supply: v });
            }}
            placeholder="1000000000"
            className="sol-input w-full px-4 py-3 text-white"
          />
          <div className="text-xs text-white/30">
            {formData.supply
              ? Number(formData.supply).toLocaleString()
              : "Enter amount"}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">
          Description <span className="text-white/30">(optional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            updateFormData({ description: e.target.value.slice(0, 200) })
          }
          placeholder="Describe your token's purpose, utility, or community..."
          rows={3}
          maxLength={200}
          className="sol-input w-full px-4 py-3 text-white resize-none"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>Stored in IPFS metadata</span>
          <span>{formData.description.length}/200</span>
        </div>
      </div>

      {/* Revoke Mint Authority */}
      <div className="glass-card-purple p-4 flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <button
            type="button"
            onClick={() =>
              updateFormData({ revokeMintAuthority: !formData.revokeMintAuthority })
            }
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              formData.revokeMintAuthority
                ? "bg-[#14F195] border-[#14F195]"
                : "bg-transparent border-white/30"
            }`}
          >
            {formData.revokeMintAuthority && (
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Revoke Mint Authority after launch
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] text-xs font-semibold">
              Recommended
            </span>
          </div>
          <p className="text-white/40 text-xs mt-1 leading-relaxed">
            Permanently prevents anyone from minting additional tokens. Proves your supply is fixed — the strongest trust signal for your community.
          </p>
        </div>
      </div>
    </div>
  );
}
