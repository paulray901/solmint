# SolMint — Solana SPL Token Launcher

**SolMint** is a no-code Solana SPL Token Launcher that lets anyone create and deploy their own token on Solana in under 2 minutes, with a flat 0.1 SOL platform fee.

---

## Features

- **3-Step Wizard**: Token details → Branding → Review & Deploy
- **On-Chain Deployment**: Uses `@solana/web3.js` and `@solana/spl-token` directly — no third-party token APIs
- **Metaplex Metadata**: Full on-chain token metadata via `@metaplex-foundation/mpl-token-metadata`
- **IPFS Storage**: Token logo and metadata uploaded to IPFS via Pinata
- **Wallet Support**: Phantom, Solflare, Backpack via `@solana/wallet-adapter-react`
- **Devnet/Mainnet Toggle**: Safe testing on devnet before going live
- **Revoke Mint Authority**: Optional permanent supply lock for community trust
- **My Tokens Page**: View all SPL tokens in your connected wallet
- **Non-Custodial**: All signing happens client-side — private keys never leave your wallet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Routing | React Router (HashRouter for GitHub Pages) |
| Wallet | `@solana/wallet-adapter-react` |
| Solana | `@solana/web3.js` v1 + `@solana/spl-token` |
| Metadata | `@metaplex-foundation/mpl-token-metadata` v3 + UMI |
| IPFS | Pinata Cloud API |
| Animations | Framer Motion |
| Build | Vite 7 |
| Deployment | GitHub Pages + GitHub Actions |

---

## Quick Start — GitHub Pages Deployment

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/solmint.git
cd solmint
```

### 2. Add GitHub Secrets

Go to your repository **Settings → Secrets and variables → Actions** and add these secrets:

| Secret Name | Value | Example |
|---|---|---|
| `VITE_FEE_WALLET_ADDRESS` | Your Solana public wallet address | `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` |
| `VITE_PINATA_API_KEY` | Your Pinata API Key | (see Pinata setup below) |
| `VITE_PINATA_SECRET` | Your Pinata API Secret | (see Pinata setup below) |

> **Important**: The fee wallet is a public address only — never put a private key here.

### 3. Push to Main Branch

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

GitHub Actions will automatically build and deploy your site to GitHub Pages. This happens on every push to the `main` branch.

### 4. Access Your Live Site

Your site will be available at:

```
https://YOUR-GITHUB-USERNAME.github.io/solmint/
```

Go to your repository **Settings → Pages** to confirm the deployment and find your live URL.

### 5. (Optional) Connect a Custom Domain

1. In your repository **Settings → Pages**, scroll to **Custom domain**
2. Enter your domain (e.g., `solmint.com`)
3. GitHub will automatically update the DNS records
4. The CNAME file in `/client/public/` will be deployed automatically

---

## Environment Variables

### Required

- **`VITE_FEE_WALLET_ADDRESS`**: The Solana public wallet address that receives the 0.1 SOL platform fee. This is set as a GitHub Secret and injected during the build.

### Optional

- **`VITE_PINATA_API_KEY`**: Your Pinata API Key (see Pinata setup below)
- **`VITE_PINATA_SECRET`**: Your Pinata API Secret (see Pinata setup below)
- **`VITE_BASE_PATH`**: Base path for the app (defaults to `/solmint/` for GitHub Pages). Set to `/` if using a custom domain.

---

## Pinata IPFS Setup

Pinata is used to permanently store your token logo and metadata on IPFS.

### Getting Pinata API Keys

1. Go to [pinata.cloud](https://pinata.cloud) and create a free account
2. Navigate to **API Keys** in your dashboard
3. Click **New Key** → enable `pinFileToIPFS` and `pinJSONToIPFS` permissions
4. Copy your **API Key** and **API Secret**
5. Add these as GitHub Secrets: `VITE_PINATA_API_KEY` and `VITE_PINATA_SECRET`

### Using Pinata in the App

Users enter their Pinata keys directly in the SolMint UI:

1. Click the **"Pinata Keys"** button on the Launch page
2. Enter your API Key and Secret API Key
3. Click **Save Keys** — they are stored locally in your browser only

> **Note**: Pinata keys are stored in `localStorage` and never sent to any server. They are used only for direct browser-to-Pinata API calls.

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server (runs at http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm check

# Format code
pnpm format
```

---

## Manual Deployment (Fallback)

If you prefer to deploy manually without GitHub Actions:

```bash
# Install gh-pages globally
npm install -g gh-pages

# Build and deploy
pnpm deploy
```

This will build the app and push the `/dist/public` folder to the `gh-pages` branch.

---

## How It Works

### Token Creation Flow

1. **Step 1 — Token Details**: Enter name, symbol, decimals, initial supply
2. **Step 2 — Branding**: Upload a logo (stored on IPFS via Pinata) and add metadata
3. **Step 3 — Review & Pay**: Review token details, connect wallet, pay 0.1 SOL fee, and deploy

### On-Chain Deployment

1. **Fee Transfer**: 0.1 SOL is transferred to the fee wallet (first transaction — if it fails, deployment aborts)
2. **Mint Creation**: A new SPL token mint is created with the specified supply
3. **Metadata**: Token metadata (name, symbol, logo URI) is written on-chain via Metaplex
4. **Associated Token Account (ATA)**: An ATA is created for your wallet
5. **Minting**: The initial supply is minted to your ATA
6. **Authority Revocation** (optional): Mint authority is revoked if you enabled "Permanent Supply Lock"

All transactions are signed by your wallet — SolMint never has access to your private keys.

---

## Security & Privacy

- **Client-Side Only**: All wallet signing happens in your browser — no private keys are sent anywhere
- **No Backend**: SolMint is a static frontend app — no server stores your data
- **IPFS Storage**: Token logos and metadata are stored on IPFS via Pinata, not on centralized servers
- **localStorage Only**: Pinata keys are stored in your browser's localStorage and never transmitted

---

## Troubleshooting

### "Buffer is not defined" Error

If you see this error during development, clear the Vite cache:

```bash
rm -rf node_modules/.vite
pnpm dev
```

### Deployment Fails on GitHub Actions

Check the GitHub Actions logs:

1. Go to your repository **Actions** tab
2. Click the failed workflow
3. Expand the **Build** step to see error details
4. Ensure all GitHub Secrets are set correctly

### Routes Not Working on GitHub Pages

Make sure `HashRouter` is being used (not `BrowserRouter`). The app uses `HashRouter` by default for GitHub Pages compatibility. Routes will look like `https://username.github.io/solmint/#/launch` instead of `https://username.github.io/solmint/launch`.

---

## File Structure

```
solmint/
├── client/
│   ├── public/
│   │   ├── CNAME                 # Custom domain (optional)
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── contexts/             # React contexts (wallet, network, form)
│   │   ├── lib/                  # Solana deployment logic
│   │   ├── App.tsx               # Main app with HashRouter
│   │   ├── main.tsx              # Entry point with Buffer polyfill
│   │   └── index.css             # Global styles
│   └── index.html
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions auto-deploy
├── vite.config.ts                # Vite config with base path
├── package.json
└── README.md
```

---

## License

MIT

---

## Support

For issues or feature requests, please open a GitHub issue in this repository.

---

## Disclaimer

SolMint is provided as-is for educational and experimental purposes. Users are responsible for understanding the risks of token creation and deployment. Always test on devnet first before deploying to mainnet. The 0.1 SOL fee is non-refundable.
