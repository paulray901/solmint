# SolMint — Design Brainstorm

## Three Design Approaches

<response>
<text>
**Design Movement**: Void-Core Brutalism meets Crypto Noir
**Core Principles**:
1. Absolute darkness as foundation — #050508 near-black with zero softness
2. Neon surgical precision — single accent color used sparingly for maximum impact
3. Monospaced data typography for all technical values (addresses, amounts)
4. Hard-edged cards with 1px neon borders, no rounded corners

**Color Philosophy**: The void of space with a single green pulse — #00ff88 neon green as the only accent against absolute black. Trust through restraint.

**Layout Paradigm**: Left-anchored asymmetric layout. Navigation on the left rail (vertical), content flows right. Hero uses a split: 60% text left, 40% animated visualization right.

**Signature Elements**:
1. Scanline overlay effect on hero (subtle CSS repeating-linear-gradient)
2. Terminal-style blinking cursor on headlines
3. Neon green underline on interactive elements, never filled buttons

**Interaction Philosophy**: Everything feels like operating a command terminal. Inputs have monospace fonts. Transitions are instant cuts, not fades.

**Animation**: Glitch text effect on hero headline. Number counters tick up on load. No easing — sharp, mechanical.

**Typography System**: "Space Mono" for headings and data, "Inter" for body copy. Stark contrast between the two.
</text>
<probability>0.07</probability>
</response>

<response>
<text>
**Design Movement**: Solana Gradient Glassmorphism — Premium Web3 SaaS
**Core Principles**:
1. Deep space background with Solana purple-to-teal gradient mesh
2. Frosted glass cards with backdrop-blur and subtle border glow
3. Layered depth — background, mid-layer particles, foreground content
4. Generous whitespace within glass containers

**Color Philosophy**: Solana's official palette — #9945FF (electric purple) to #14F195 (neon green). The gradient represents the duality of creation (purple = power, green = growth). Background is #0a0a0f deep black.

**Layout Paradigm**: Centered hero with full-viewport gradient mesh background. Wizard steps in a centered glass card that morphs between steps. Stats float in glass pills below hero.

**Signature Elements**:
1. Animated gradient mesh background (CSS custom properties + JS mouse parallax)
2. Glass cards with `backdrop-filter: blur(20px)` and `border: 1px solid rgba(255,255,255,0.1)`
3. Gradient text on key headings using Solana purple-to-green

**Interaction Philosophy**: Smooth, fluid, premium. Every action feels satisfying. Progress steps animate with spring physics. Hover states glow.

**Animation**: Particle field in hero (canvas-based). Step transitions use slide + fade. Success screen has confetti burst.

**Typography System**: "Space Grotesk" for headings (bold, modern), "Inter" for body. Gradient text on hero headline.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
**Design Movement**: Cyberpunk Terminal — Dark Utility with Neon Pulse
**Core Principles**:
1. Grid-based dark background with subtle glowing grid lines
2. Electric purple as primary, acid green as success/CTA
3. Sharp geometric shapes — diamond bullets, angular progress bars
4. Information density — show users exactly what's happening on-chain

**Color Philosophy**: Deep navy-black (#0d0d1a) with electric purple (#9945FF) primary and neon green (#00ff88) for success states. Inspired by circuit boards and blockchain explorers.

**Layout Paradigm**: Full-width sections with contained max-width. Hero uses a 3-column asymmetric grid: large headline left, animated token card center, stats right.

**Signature Elements**:
1. Animated glowing grid in hero background (SVG pattern + CSS animation)
2. Angular progress tracker with diamond-shaped step indicators
3. Token card mock-up that rotates on hover (3D CSS transform)

**Interaction Philosophy**: Every interaction provides immediate visual feedback. The form wizard feels like configuring a smart contract — precise, deliberate, powerful.

**Animation**: Grid pulses on load. Step transitions use horizontal slide. Token card has subtle 3D tilt on hover.

**Typography System**: "Syne" for display headings (geometric, bold), "Space Grotesk" for UI labels, "JetBrains Mono" for addresses and technical data.
</text>
<probability>0.06</probability>
</response>

---

## Selected Approach: **Solana Gradient Glassmorphism — Premium Web3 SaaS**

Deep space dark background (#0a0a0f) with animated Solana purple-to-green gradient mesh. Frosted glass cards for the wizard. Particle field in hero. Space Grotesk headings with gradient text. This approach best matches the "premium and trustworthy" requirement while staying true to Solana's brand identity.
