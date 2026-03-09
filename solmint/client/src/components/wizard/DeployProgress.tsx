/**
 * SolMint Deploy Progress Component
 * Design: Solana Gradient Glassmorphism
 * Shows step-by-step deployment progress with animated states
 */
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, XCircle, ExternalLink } from "lucide-react";
import { DeployStep, DeployProgress as DeployProgressType, getSolscanTxUrl } from "@/lib/solana";
import { useNetwork } from "@/contexts/NetworkContext";

interface Props {
  progress: DeployProgressType;
  onRetry?: () => void;
}

const STEPS: { key: DeployStep; label: string }[] = [
  { key: "paying_fee", label: "Paying 0.1 SOL fee" },
  { key: "creating_mint", label: "Creating token mint" },
  { key: "creating_metadata", label: "Attaching metadata" },
  { key: "creating_ata", label: "Creating token account" },
  { key: "minting_tokens", label: "Minting tokens to wallet" },
];

const STEP_ORDER: DeployStep[] = [
  "paying_fee",
  "creating_mint",
  "creating_metadata",
  "creating_ata",
  "minting_tokens",
];

function getStepState(
  stepKey: DeployStep,
  currentStep: DeployStep
): "pending" | "active" | "done" | "error" {
  if (currentStep === "error") {
    const currentIdx = STEP_ORDER.indexOf(currentStep);
    const stepIdx = STEP_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "error";
    return "pending";
  }
  if (currentStep === "success") return "done";
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const stepIdx = STEP_ORDER.indexOf(stepKey);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function DeployProgressComponent({ progress, onRetry }: Props) {
  const { network } = useNetwork();

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {progress.step === "error"
            ? "Deployment Failed"
            : progress.step === "success"
            ? "Token Launched! 🚀"
            : "Deploying Your Token..."}
        </h2>
        <p className="text-white/40 text-sm">
          {progress.step === "error"
            ? "Something went wrong. Check the error below."
            : progress.step === "success"
            ? "Your SPL token is live on Solana!"
            : "Please approve transactions in your wallet. Do not close this window."}
        </p>
      </div>

      {/* Step tracker */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = getStepState(step.key, progress.step);
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                state === "active"
                  ? "glass-card-purple"
                  : state === "done"
                  ? "bg-[#14F195]/5 border border-[#14F195]/15 rounded-xl"
                  : state === "error"
                  ? "bg-red-500/5 border border-red-500/15 rounded-xl"
                  : "bg-white/2 border border-white/5 rounded-xl"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {state === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#14F195]" />
                ) : state === "active" ? (
                  <Loader2 className="w-5 h-5 text-[#9945FF] animate-spin" />
                ) : state === "error" ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/15" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    state === "done"
                      ? "text-[#14F195]"
                      : state === "active"
                      ? "text-white"
                      : state === "error"
                      ? "text-red-400"
                      : "text-white/30"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {step.label}
                </div>
                {state === "active" && (
                  <div className="text-xs text-white/40 mt-0.5">{progress.message}</div>
                )}
              </div>

              {/* TX link */}
              {state === "done" && progress.txSignature && step.key === progress.step && (
                <a
                  href={getSolscanTxUrl(progress.txSignature, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Error message */}
      {progress.step === "error" && progress.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <div className="text-sm font-semibold text-red-400 mb-1">Error Details</div>
          <div className="text-xs text-red-400/70 font-mono break-all">{progress.error}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          )}
        </motion.div>
      )}

      {/* Warning: don't close */}
      {progress.step !== "error" && progress.step !== "success" && progress.step !== "idle" && (
        <div className="flex items-center gap-2 text-xs text-amber-400/70">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Keep this window open until all steps complete
        </div>
      )}
    </div>
  );
}
