/**
 * SolMint Home Page
 * Design: Solana Gradient Glassmorphism — Premium Web3 SaaS
 * - Hero with animated particle background and gradient mesh
 * - Trust bar with stats
 * - Features section
 * - How it works
 * - FAQ accordion
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Zap, Shield, Globe, ChevronDown, ChevronUp,
  Rocket, Coins, Image, CheckCircle2, ArrowRight,
  Twitter, Send, ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Particle animation hook
function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: Math.random() > 0.5 ? "#9945FF" : "#14F195",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(153,69,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

// Counter animation
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const faqs = [
  {
    q: "What is an SPL Token?",
    a: "An SPL (Solana Program Library) Token is the standard for fungible tokens on the Solana blockchain — similar to ERC-20 on Ethereum. SPL tokens can represent anything: currencies, governance rights, loyalty points, or meme coins.",
  },
  {
    q: "Will I own 100% of the supply?",
    a: "Yes. When you launch your token, 100% of the total supply is minted directly to your connected wallet. You have full control from day one.",
  },
  {
    q: "Can I add liquidity after?",
    a: "Absolutely. After launching, you can add liquidity on Raydium, Orca, or any Solana DEX. Your mint address is all you need to list your token.",
  },
  {
    q: "Is the 0.1 SOL fee refundable?",
    a: "No. The 0.1 SOL platform fee is non-refundable as it covers the cost of token deployment, metadata storage, and platform maintenance. Solana network fees (~0.01 SOL) are also required and go directly to validators.",
  },
  {
    q: "What does 'Revoke Mint Authority' mean?",
    a: "Revoking mint authority permanently prevents anyone — including you — from ever minting additional tokens. This is recommended for trust, as it proves your token supply is fixed. Without revoking, you could theoretically inflate the supply later.",
  },
  {
    q: "Is this safe? Are my private keys exposed?",
    a: "Your private keys never leave your wallet. All transactions are signed locally in your Phantom, Solflare, or Backpack wallet. SolMint only constructs and sends unsigned transactions — you always approve every action.",
  },
];

const steps = [
  {
    num: "01",
    icon: <Coins className="w-6 h-6" />,
    title: "Fill Token Details",
    desc: "Set your token name, symbol, supply, and decimals. No technical knowledge required.",
  },
  {
    num: "02",
    icon: <Image className="w-6 h-6" />,
    title: "Upload Logo & Branding",
    desc: "Upload your token logo and add social links. Your metadata is stored permanently on IPFS.",
  },
  {
    num: "03",
    icon: <Zap className="w-6 h-6" />,
    title: "Pay & Deploy",
    desc: "Review everything, pay the 0.1 SOL fee, and watch your token deploy on-chain in seconds.",
  },
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663415226055/LzMakPG2aGmUsNJZz8vb24/solmint-hero-bg-RzpL9R2L6nrsV4GBGnooNr.webp)`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/20 via-transparent to-[#0a0a0f]" />

        {/* Particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/30 text-[#9945FF] text-sm font-semibold mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
            Powered by Solana
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Launch Your Solana Token{" "}
            <span className="gradient-text">in 60 Seconds</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No code. No wallets to configure. Just fill, pay, deploy.
            Your SPL token on mainnet — flat 0.1 SOL fee.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/launch">
              <button className="btn-gradient px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 shadow-[0_0_40px_rgba(153,69,255,0.3)] hover:shadow-[0_0_60px_rgba(153,69,255,0.5)] transition-all duration-300">
                <span>Launch Your Token</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              How it works
            </a>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { label: "Tokens Launched", value: 1247, suffix: "+" },
              { label: "Flat Fee", value: null, display: "0.1 SOL" },
              { label: "Avg Deploy Time", value: null, display: "< 30s" },
              { label: "Mainnet Ready", value: null, display: "✓" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-2xl font-bold gradient-text"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value !== null ? (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  ) : (
                    stat.display
                  )}
                </div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Deploy in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              No Rust. No CLI. No wallet configuration. Just connect and launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card p-8 relative group hover:border-[#9945FF]/30 transition-all duration-300"
              >
                <div className="text-5xl font-black text-white/5 absolute top-6 right-6"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/20 flex items-center justify-center text-[#9945FF] mb-6 group-hover:shadow-[0_0_20px_rgba(153,69,255,0.3)] transition-all duration-300">
                  {step.icon}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link href="/launch">
              <button className="btn-gradient px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 mx-auto">
                <span>Start Now — 0.1 SOL</span>
                <Rocket className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9945FF]/3 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Everything You Need to{" "}
              <span className="gradient-text">Go Live</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Shield className="w-5 h-5 text-[#9945FF]" />,
                title: "Non-Custodial",
                desc: "Your private keys never leave your wallet. All signing happens client-side.",
              },
              {
                icon: <Zap className="w-5 h-5 text-[#14F195]" />,
                title: "On-Chain Metadata",
                desc: "Full Metaplex Token Metadata — name, symbol, logo, and social links stored on-chain.",
              },
              {
                icon: <Globe className="w-5 h-5 text-[#9945FF]" />,
                title: "IPFS Permanent Storage",
                desc: "Your token logo and metadata are pinned to IPFS via Pinata — permanent and decentralized.",
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-[#14F195]" />,
                title: "Revoke Mint Authority",
                desc: "Optionally lock your supply forever — the strongest trust signal for your community.",
              },
              {
                icon: <Twitter className="w-5 h-5 text-[#9945FF]" />,
                title: "Social Links",
                desc: "Embed your website, Twitter/X, and Telegram directly in your token metadata.",
              },
              {
                icon: <ExternalLink className="w-5 h-5 text-[#14F195]" />,
                title: "Solscan & DEX Ready",
                desc: "Instantly view on Solscan. Add liquidity on Raydium or Orca right after launch.",
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card p-6 hover:border-white/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feat.icon}
                </div>
                <h3
                  className="text-base font-semibold text-white mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {feat.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Token Card Preview ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-4xl font-bold mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Your Token.{" "}
                <span className="gradient-text">Your Brand.</span>
              </h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                Upload a custom logo, add your social links, and set your token metadata.
                Everything is stored permanently on IPFS and registered on-chain via Metaplex.
              </p>
              <div className="space-y-4">
                {[
                  "Custom name, symbol & supply",
                  "Logo uploaded to IPFS (permanent)",
                  "On-chain Metaplex metadata",
                  "Website, Twitter & Telegram links",
                  "Optional: Revoke mint authority",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#14F195] flex-shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663415226055/LzMakPG2aGmUsNJZz8vb24/solmint-token-card-WsgWQ8VqFuF9caFJ36kj2P.webp"
                  alt="Token Card Preview"
                  className="w-64 rounded-2xl shadow-[0_0_60px_rgba(153,69,255,0.3)] hover:shadow-[0_0_80px_rgba(153,69,255,0.5)] transition-all duration-500 hover:scale-105"
                />
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 -z-10 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
                >
                  <span
                    className="font-semibold text-white pr-4"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#9945FF] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gradient-border"
          >
            <div className="glass-card-purple p-12 text-center rounded-2xl">
              <h2
                className="text-4xl font-bold mb-4 text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Ready to Launch?
              </h2>
              <p className="text-white/50 mb-8 text-lg">
                Your token is 60 seconds away. Flat 0.1 SOL. No hidden fees.
              </p>
              <Link href="/launch">
                <button className="btn-gradient px-10 py-4 rounded-xl text-lg font-bold flex items-center gap-2 mx-auto shadow-[0_0_40px_rgba(153,69,255,0.4)]">
                  <span>Launch Your Token Now</span>
                  <Rocket className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <Zap className="w-3 h-3 text-black" fill="currentColor" />
            </div>
            <span
              className="font-bold gradient-text"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SolMint
            </span>
          </div>
          <p className="text-white/30 text-sm">
            Built on Solana. Non-custodial. Open source.
          </p>
          <div className="flex items-center gap-4 text-white/30 text-sm">
            <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
            <Link href="/launch" className="hover:text-white/60 transition-colors">Launch</Link>
            <Link href="/my-tokens" className="hover:text-white/60 transition-colors">My Tokens</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
