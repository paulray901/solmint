/**
 * SolMint Launch Page — 3-Step Token Creation Wizard
 * Design: Solana Gradient Glassmorphism
 *
 * Steps:
 * 1. Token Details
 * 2. Token Branding
 * 3. Review & Pay
 *
 * After step 3: Deploy progress → Success screen
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTokenForm } from "@/contexts/TokenFormContext";
import { useNetwork } from "@/contexts/NetworkContext";
import {
  deployToken,
  uploadMetadataToPinata,
  DeployProgress,
} from "@/lib/solana";
import Navbar from "@/components/Navbar";
import Step1TokenDetails from "@/components/wizard/Step1TokenDetails";
import Step2TokenBranding from "@/components/wizard/Step2TokenBranding";
import Step3ReviewPay from "@/components/wizard/Step3ReviewPay";
import DeployProgressComponent from "@/components/wizard/DeployProgress";
import SuccessScreen from "@/components/wizard/SuccessScreen";
import { Settings, ChevronLeft, ChevronRight, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { num: 1, label: "Token Details" },
  { num: 2, label: "Branding" },
  { num: 3, label: "Review & Pay" },
];

export default function Launch() {
  const { formData, currentStep, setCurrentStep, resetForm } = useTokenForm();
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();

  // Pinata keys (stored in localStorage for convenience)
  const [pinataApiKey, setPinataApiKey] = useState(
    () => localStorage.getItem("solmint_pinata_api_key") || ""
  );
  const [pinataSecretKey, setPinataSecretKey] = useState(
    () => localStorage.getItem("solmint_pinata_secret_key") || ""
  );
  const [showPinataSettings, setShowPinataSettings] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Deploy state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState<DeployProgress>({
    step: "idle",
    message: "",
  });
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const savePinataKeys = () => {
    localStorage.setItem("solmint_pinata_api_key", pinataApiKey);
    localStorage.setItem("solmint_pinata_secret_key", pinataSecretKey);
    toast.success("Pinata keys saved");
    setShowPinataSettings(false);
  };

  const canProceedStep1 =
    formData.name.trim().length > 0 &&
    formData.symbol.trim().length > 0 &&
    formData.supply &&
    Number(formData.supply) > 0;

  const canProceedStep2 = true; // Branding is optional

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) {
      toast.error("Please fill in Token Name, Symbol, and Supply");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleDeploy = async () => {
    if (!publicKey || !signTransaction || !connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);
    setShowProgress(true);
    setDeployProgress({ step: "uploading_metadata", message: "Preparing metadata..." });

    try {
      // Upload metadata to IPFS if Pinata keys are set
      let metadataUri = "";
      if (pinataApiKey && pinataSecretKey) {
        setDeployProgress({
          step: "uploading_metadata",
          message: "Uploading metadata to IPFS...",
        });
        try {
          metadataUri = await uploadMetadataToPinata({
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            logoIpfsUri: formData.logoIpfsUri,
            websiteUrl: formData.websiteUrl,
            twitterUrl: formData.twitterUrl,
            telegramUrl: formData.telegramUrl,
            pinataApiKey,
            pinataSecretKey,
          });
        } catch (err) {
          toast.error("Metadata upload failed — continuing without IPFS metadata");
          console.warn("Metadata upload failed:", err);
        }
      }

      // Deploy the token
      const supply = BigInt(formData.supply) * BigInt(10 ** formData.decimals);

      const finalMintAddress = await deployToken({
        connection,
        walletPublicKey: publicKey,
        signTransaction,
        signAllTransactions,
        tokenName: formData.name,
        tokenSymbol: formData.symbol,
        decimals: formData.decimals,
        supply,
        metadataUri,
        revokeMintAuthority: formData.revokeMintAuthority,
        onProgress: setDeployProgress,
      });

      setMintAddress(finalMintAddress);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Deployment failed";
      console.error("Deploy error:", err);
      // Error is already set in deployProgress by the deployToken function
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRetry = () => {
    setShowProgress(false);
    setDeployProgress({ step: "idle", message: "" });
    setIsDeploying(false);
  };

  const handleLaunchAnother = () => {
    resetForm();
    setMintAddress(null);
    setShowProgress(false);
    setDeployProgress({ step: "idle", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#9945FF]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14F195]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Launch Token
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Create and deploy your SPL token on Solana
              </p>
            </div>

            {/* Pinata settings button */}
            <button
              onClick={() => setShowPinataSettings(!showPinataSettings)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                showPinataSettings
                  ? "bg-[#9945FF]/20 border border-[#9945FF]/30 text-[#9945FF]"
                  : "glass-card hover:border-white/15 text-white/50 hover:text-white"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Key className="w-4 h-4" />
              Pinata Keys
            </button>
          </div>

          {/* Pinata Settings Panel */}
          <AnimatePresence>
            {showPinataSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-5 mb-6 space-y-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-[#9945FF]" />
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Pinata IPFS Configuration
                  </span>
                </div>
                <p className="text-xs text-white/40">
                  Required for uploading your token logo and metadata to IPFS.
                  Get your keys at{" "}
                  <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer"
                    className="text-[#9945FF] hover:underline">
                    pinata.cloud
                  </a>
                  . Keys are stored locally in your browser only.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">API Key</label>
                    <input
                      type="text"
                      value={pinataApiKey}
                      onChange={(e) => setPinataApiKey(e.target.value)}
                      placeholder="Enter Pinata API Key"
                      className="sol-input w-full px-3 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Secret API Key</label>
                    <div className="relative">
                      <input
                        type={showSecret ? "text" : "password"}
                        value={pinataSecretKey}
                        onChange={(e) => setPinataSecretKey(e.target.value)}
                        placeholder="Enter Pinata Secret Key"
                        className="sol-input w-full px-3 py-2.5 pr-10 text-sm text-white"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={savePinataKeys}
                  className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span>Save Keys</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wallet not connected */}
          {!connected && (
            <div className="glass-card-purple p-5 mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Connect your wallet to continue
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  Phantom, Solflare, or Backpack required
                </div>
              </div>
              <WalletMultiButton />
            </div>
          )}

          {/* Main wizard card */}
          <div className="glass-card p-6 sm:p-8">
            {/* Show success screen */}
            {mintAddress ? (
              <SuccessScreen
                mintAddress={mintAddress}
                onLaunchAnother={handleLaunchAnother}
              />
            ) : showProgress ? (
              /* Show deploy progress */
              <DeployProgressComponent
                progress={deployProgress}
                onRetry={deployProgress.step === "error" ? handleRetry : undefined}
              />
            ) : (
              /* Show wizard steps */
              <>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {STEPS.map((step, i) => (
                    <div key={step.num} className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            currentStep === step.num
                              ? "step-active"
                              : currentStep > step.num
                              ? "step-completed"
                              : "step-inactive"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {currentStep > step.num ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step.num
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium hidden sm:block transition-colors ${
                            currentStep === step.num
                              ? "text-white"
                              : currentStep > step.num
                              ? "text-[#14F195]"
                              : "text-white/30"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-px w-8 sm:w-16 transition-colors duration-300 ${
                            currentStep > step.num ? "bg-[#14F195]/40" : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentStep === 1 && <Step1TokenDetails />}
                    {currentStep === 2 && (
                      <Step2TokenBranding
                        pinataApiKey={pinataApiKey}
                        pinataSecretKey={pinataSecretKey}
                      />
                    )}
                    {currentStep === 3 && (
                      <Step3ReviewPay
                        onDeploy={handleDeploy}
                        isDeploying={isDeploying}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons (not shown on step 3 — it has its own deploy button) */}
                {currentStep < 3 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        currentStep === 1
                          ? "text-white/20 cursor-not-allowed"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="btn-gradient flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Back button on step 3 */}
                {currentStep === 3 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Branding
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
