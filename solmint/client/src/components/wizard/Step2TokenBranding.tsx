/**
 * SolMint Wizard Step 2 — Token Branding
 * Design: Solana Gradient Glassmorphism
 * - Drag & drop logo upload
 * - Pinata IPFS upload
 * - Social links
 * - Token card preview
 */
import { useState, useRef, useCallback } from "react";
import { useTokenForm } from "@/contexts/TokenFormContext";
import { uploadImageToPinata } from "@/lib/solana";
import { Upload, Globe, Twitter, Send, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Step2Props {
  pinataApiKey: string;
  pinataSecretKey: string;
}

export default function Step2TokenBranding({ pinataApiKey, pinataSecretKey }: Step2Props) {
  const { formData, updateFormData } = useTokenForm();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
        toast.error("Invalid file type. Use PNG, JPG, GIF, or WebP.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 2MB.");
        return;
      }

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      updateFormData({ logoFile: file, logoPreviewUrl: previewUrl, logoIpfsUri: "" });

      // Upload to IPFS if keys are provided
      if (pinataApiKey && pinataSecretKey) {
        setUploading(true);
        try {
          const ipfsUri = await uploadImageToPinata(file, pinataApiKey, pinataSecretKey);
          updateFormData({ logoIpfsUri: ipfsUri });
          toast.success("Logo uploaded to IPFS ✓");
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          toast.error(`IPFS upload failed: ${msg}`);
          updateFormData({ logoIpfsUri: "" });
        } finally {
          setUploading(false);
        }
      } else {
        toast.info("Add Pinata keys in settings to upload to IPFS");
      }
    },
    [pinataApiKey, pinataSecretKey, updateFormData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const removeLogo = () => {
    updateFormData({ logoFile: null, logoPreviewUrl: "", logoIpfsUri: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Token Branding
        </h2>
        <p className="text-white/40 text-sm">Upload your logo and add social links.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload + Social */}
        <div className="space-y-5">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Token Logo <span className="text-white/30">(optional)</span>
            </label>

            {formData.logoPreviewUrl ? (
              <div className="relative flex items-center gap-4 p-4 glass-card">
                <img
                  src={formData.logoPreviewUrl}
                  alt="Token logo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#9945FF]/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {formData.logoFile?.name}
                  </div>
                  {uploading ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading to IPFS...
                    </div>
                  ) : formData.logoIpfsUri ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#14F195] mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Uploaded to IPFS
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-white/30 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Local preview only (add Pinata keys)
                    </div>
                  )}
                </div>
                <button
                  onClick={removeLogo}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[#9945FF] bg-[#9945FF]/10"
                    : "border-white/15 hover:border-[#9945FF]/40 hover:bg-white/3"
                }`}
              >
                <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="text-white/30 text-xs mt-1">PNG, JPG, GIF — max 2MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/70">
              Social Links <span className="text-white/30">(optional)</span>
            </label>

            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
                placeholder="https://yourtoken.io"
                className="sol-input flex-1 px-3 py-2.5 text-sm text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Twitter className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => updateFormData({ twitterUrl: e.target.value })}
                placeholder="https://twitter.com/yourtoken"
                className="sol-input flex-1 px-3 py-2.5 text-sm text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Send className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                type="url"
                value={formData.telegramUrl}
                onChange={(e) => updateFormData({ telegramUrl: e.target.value })}
                placeholder="https://t.me/yourtoken"
                className="sol-input flex-1 px-3 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Right: Token Card Preview */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs text-white/30 mb-4 uppercase tracking-widest">Preview</p>
          <div className="glass-card-purple p-6 w-52 flex flex-col items-center gap-4 rounded-2xl shadow-[0_0_40px_rgba(153,69,255,0.2)]">
            {/* Logo */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#9945FF]/30 to-[#14F195]/30 border-2 border-[#9945FF]/30 flex items-center justify-center">
              {formData.logoPreviewUrl ? (
                <img
                  src={formData.logoPreviewUrl}
                  alt="Token logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formData.symbol ? formData.symbol[0] : "?"}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="text-center">
              <div
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {formData.name || "Token Name"}
              </div>
              <div className="text-sm text-[#9945FF] font-semibold mt-0.5">
                ${formData.symbol || "SYM"}
              </div>
            </div>

            {/* Supply */}
            <div className="w-full border-t border-white/10 pt-3 text-center">
              <div className="text-xs text-white/40 mb-0.5">Total Supply</div>
              <div className="text-sm font-semibold text-white font-mono">
                {formData.supply
                  ? Number(formData.supply).toLocaleString()
                  : "—"}
              </div>
            </div>

            {/* Solana badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
              <span className="text-xs text-[#9945FF] font-semibold">Solana SPL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
