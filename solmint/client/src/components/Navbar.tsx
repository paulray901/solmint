/**
 * SolMint Navbar
 * Design: Solana Gradient Glassmorphism
 * - Glass morphism navbar with gradient logo
 * - Wallet connect button (wallet-adapter)
 * - Devnet/Mainnet toggle
 * - SOL balance display
 * - Mobile responsive
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useNetwork } from "@/contexts/NetworkContext";
import { AlertTriangle, Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { network, setNetwork, isDevnet } = useNetwork();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch SOL balance
  useEffect(() => {
    if (!connected || !publicKey) {
      setSolBalance(null);
      return;
    }
    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
      } catch {
        setSolBalance(null);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/launch", label: "Launch Token" },
    { href: "/my-tokens", label: "My Tokens" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(153,69,255,0.5)] transition-all duration-300">
              <Zap className="w-4 h-4 text-black" fill="currentColor" />
            </div>
            <span
              className="text-xl font-bold gradient-text"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SolMint
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-white"
                    : "text-white/50 hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Network Toggle */}
            <button
              onClick={() => setNetwork(isDevnet ? "mainnet-beta" : "devnet")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isDevnet
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  : "bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] hover:bg-[#14F195]/20"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDevnet ? "bg-amber-400" : "bg-[#14F195]"
                } animate-pulse`}
              />
              {isDevnet ? "Devnet" : "Mainnet"}
            </button>

            {/* Balance warning */}
            {connected && solBalance !== null && solBalance < 0.1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>Low SOL</span>
              </div>
            )}

            {/* Balance display */}
            {connected && solBalance !== null && (
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono">
                {solBalance.toFixed(3)} SOL
              </div>
            )}

            {/* Wallet Button */}
            <WalletMultiButton />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4">
          <div className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 transition-colors ${
                  pathname === link.href ? "text-white" : "text-white/50"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setNetwork(isDevnet ? "mainnet-beta" : "devnet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isDevnet
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDevnet ? "bg-amber-400" : "bg-[#14F195]"} animate-pulse`} />
                {isDevnet ? "Devnet" : "Mainnet"}
              </button>
              {connected && solBalance !== null && (
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono">
                  {solBalance.toFixed(3)} SOL
                </div>
              )}
            </div>
            <WalletMultiButton />
          </div>
        </div>
      )}
    </nav>
  );
}
