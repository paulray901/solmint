/**
 * SolMint 404 Not Found Page
 * Design: Solana Gradient Glassmorphism
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className="text-8xl font-black gradient-text mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          404
        </div>
        <h1
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Page Not Found
        </h1>
        <p className="text-white/40 mb-8">
          This page doesn't exist on-chain or off-chain.
        </p>
        <Link href="/">
          <button className="btn-gradient px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
