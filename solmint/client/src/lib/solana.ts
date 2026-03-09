/**
 * SolMint Solana Token Deployment Service
 * Design: Solana Gradient Glassmorphism
 *
 * IMPORTANT SECURITY NOTES:
 * - All wallet signing happens client-side only
 * - Private keys never leave the user's wallet
 * - The 0.1 SOL fee is the FIRST transaction — abort if it fails
 */
import { Buffer } from "buffer";
if (typeof globalThis.Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
}
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

// Fee wallet address — set via env variable
export const FEE_WALLET_ADDRESS =
  import.meta.env.VITE_FEE_WALLET_ADDRESS ||
  "11111111111111111111111111111111"; // Fallback to system program (should be overridden)

export const FEE_AMOUNT_SOL = 0.1;
export const FEE_AMOUNT_LAMPORTS = FEE_AMOUNT_SOL * LAMPORTS_PER_SOL;

export type DeployStep =
  | "idle"
  | "uploading_metadata"
  | "paying_fee"
  | "creating_mint"
  | "creating_metadata"
  | "creating_ata"
  | "minting_tokens"
  | "revoking_authority"
  | "success"
  | "error";

export interface DeployProgress {
  step: DeployStep;
  message: string;
  txSignature?: string;
  mintAddress?: string;
  error?: string;
}

export interface TokenDeployParams {
  connection: Connection;
  walletPublicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  supply: bigint;
  metadataUri: string;
  revokeMintAuthority: boolean;
  onProgress: (progress: DeployProgress) => void;
}

/**
 * Upload token metadata JSON to IPFS via Pinata
 */
export async function uploadMetadataToPinata(params: {
  name: string;
  symbol: string;
  description: string;
  logoIpfsUri: string;
  websiteUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  pinataApiKey: string;
  pinataSecretKey: string;
}): Promise<string> {
  const metadata: Record<string, unknown> = {
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    image: params.logoIpfsUri,
    external_url: params.websiteUrl || undefined,
    attributes: [],
    properties: {
      files: params.logoIpfsUri
        ? [{ uri: params.logoIpfsUri, type: "image/png" }]
        : [],
      category: "fungible",
    },
  };

  // Add social links
  const extensions: Record<string, string> = {};
  if (params.websiteUrl) extensions.website = params.websiteUrl;
  if (params.twitterUrl) extensions.twitter = params.twitterUrl;
  if (params.telegramUrl) extensions.telegram = params.telegramUrl;
  if (Object.keys(extensions).length > 0) {
    metadata.extensions = extensions;
  }

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: params.pinataApiKey,
        pinata_secret_api_key: params.pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${params.symbol}-metadata.json` },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinata metadata upload failed: ${err}`);
  }

  const result = await response.json();
  return `https://ipfs.io/ipfs/${result.IpfsHash}`;
}

/**
 * Upload token logo image to IPFS via Pinata
 */
export async function uploadImageToPinata(
  file: File,
  pinataApiKey: string,
  pinataSecretKey: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `token-logo-${Date.now()}` })
  );

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinata image upload failed: ${err}`);
  }

  const result = await response.json();
  return `https://ipfs.io/ipfs/${result.IpfsHash}`;
}

/**
 * Main token deployment function
 * Order: Fee → Mint → Metadata → ATA → Mint tokens → (optional) Revoke
 */
export async function deployToken(params: TokenDeployParams): Promise<string> {
  const {
    connection,
    walletPublicKey,
    signTransaction,
    tokenName,
    tokenSymbol,
    decimals,
    supply,
    metadataUri,
    revokeMintAuthority,
    onProgress,
  } = params;

  try {
    // ── Step 1: Pay the 0.1 SOL fee FIRST ──
    // If this fails, abort everything
    onProgress({
      step: "paying_fee",
      message: "Sending 0.1 SOL platform fee...",
    });

    const feeWallet = new PublicKey(FEE_WALLET_ADDRESS);
    const { blockhash: feeBlockhash, lastValidBlockHeight: feeLastValid } =
      await connection.getLatestBlockhash("confirmed");

    const feeTx = new Transaction({
      recentBlockhash: feeBlockhash,
      feePayer: walletPublicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: feeWallet,
        lamports: FEE_AMOUNT_LAMPORTS,
      })
    );

    const signedFeeTx = await signTransaction(feeTx);
    const feeSignature = await connection.sendRawTransaction(
      signedFeeTx.serialize()
    );

    // Wait for fee confirmation — abort if fails
    await connection.confirmTransaction(
      { signature: feeSignature, blockhash: feeBlockhash, lastValidBlockHeight: feeLastValid },
      "confirmed"
    );

    onProgress({
      step: "paying_fee",
      message: "Fee paid successfully ✓",
      txSignature: feeSignature,
    });

    // ── Step 2: Create SPL Token Mint ──
    onProgress({
      step: "creating_mint",
      message: "Creating token mint account...",
    });

    // Generate a new keypair for the mint account
    const mintKeypair = Keypair.generate();
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    const { blockhash: mintBlockhash, lastValidBlockHeight: mintLastValid } =
      await connection.getLatestBlockhash("confirmed");

    const mintTx = new Transaction({
      recentBlockhash: mintBlockhash,
      feePayer: walletPublicKey,
    })
      .add(
        // Create the mint account
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      )
      .add(
        // Initialize the mint
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          walletPublicKey, // mint authority
          walletPublicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

    // Sign with both wallet and mint keypair
    const signedMintTx = await signTransaction(mintTx);
    signedMintTx.partialSign(mintKeypair);

    const mintSignature = await connection.sendRawTransaction(
      signedMintTx.serialize()
    );
    await connection.confirmTransaction(
      { signature: mintSignature, blockhash: mintBlockhash, lastValidBlockHeight: mintLastValid },
      "confirmed"
    );

    const mintAddress = mintKeypair.publicKey.toBase58();

    onProgress({
      step: "creating_mint",
      message: "Token mint created ✓",
      txSignature: mintSignature,
      mintAddress,
    });

    // ── Step 3: Create On-Chain Metadata via Metaplex ──
    onProgress({
      step: "creating_metadata",
      message: "Attaching on-chain metadata...",
    });

    try {
      // Use UMI + mpl-token-metadata v3 for on-chain metadata
      const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
      const { mplTokenMetadata, createMetadataAccountV3 } =
        await import("@metaplex-foundation/mpl-token-metadata");
      const { publicKey: umiPublicKey, none, signerIdentity, createSignerFromKeypair } =
        await import("@metaplex-foundation/umi");
      const { fromWeb3JsPublicKey, fromWeb3JsKeypair } =
        await import("@metaplex-foundation/umi-web3js-adapters");

      const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());

      // Build a custom signer that delegates to the wallet adapter
      const umiWalletPubkey = fromWeb3JsPublicKey(walletPublicKey);
      const customSigner = {
        publicKey: umiWalletPubkey,
        signTransaction: async (tx: any) => {
          // Convert UMI transaction to web3.js, sign, convert back
          const { toWeb3JsLegacyTransaction, fromWeb3JsLegacyTransaction } =
            await import("@metaplex-foundation/umi-web3js-adapters");
          const web3Tx = toWeb3JsLegacyTransaction(tx);
          const signed = await signTransaction(web3Tx);
          return fromWeb3JsLegacyTransaction(signed);
        },
        signAllTransactions: async (txs: any[]) => {
          return Promise.all(txs.map(async (tx: any) => {
            const { toWeb3JsLegacyTransaction, fromWeb3JsLegacyTransaction } =
              await import("@metaplex-foundation/umi-web3js-adapters");
            const web3Tx = toWeb3JsLegacyTransaction(tx);
            const signed = await signTransaction(web3Tx);
            return fromWeb3JsLegacyTransaction(signed);
          }));
        },
        signMessage: async (msg: Uint8Array) => ({ signature: msg, signedMessage: msg }),
      };
      umi.use(signerIdentity(customSigner as any));

      const mintUmiKey = fromWeb3JsPublicKey(mintKeypair.publicKey);

      const metaTxBuilder = createMetadataAccountV3(umi, {
        mint: mintUmiKey,
        mintAuthority: customSigner as any,
        payer: customSigner as any,
        updateAuthority: umiWalletPubkey,
        data: {
          name: tokenName,
          symbol: tokenSymbol,
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: none(),
          collection: none(),
          uses: none(),
        },
        isMutable: true,
        collectionDetails: none(),
      });

      const metaResult = await metaTxBuilder.sendAndConfirm(umi);
      const metaSignature = Buffer.from(metaResult.signature).toString("base64");

      onProgress({
        step: "creating_metadata",
        message: "On-chain metadata attached ✓",
        txSignature: metaSignature,
        mintAddress,
      });
    } catch (metaError) {
      // Metadata is optional — continue if it fails
      console.warn("Metadata creation failed (non-fatal):", metaError);
      onProgress({
        step: "creating_metadata",
        message: "Metadata skipped (continuing) ✓",
        mintAddress,
      });
    }

    // ── Step 4: Create ATA and Mint Full Supply ──
    onProgress({
      step: "creating_ata",
      message: "Creating token account...",
    });

    const ata = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      walletPublicKey
    );

    const { blockhash: ataBlockhash, lastValidBlockHeight: ataLastValid } =
      await connection.getLatestBlockhash("confirmed");

    const ataMintTx = new Transaction({
      recentBlockhash: ataBlockhash,
      feePayer: walletPublicKey,
    })
      .add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey, // payer
          ata,
          walletPublicKey, // owner
          mintKeypair.publicKey
        )
      )
      .add(
        createMintToInstruction(
          mintKeypair.publicKey,
          ata,
          walletPublicKey, // mint authority
          supply
        )
      );

    // Add revoke instruction if requested
    if (revokeMintAuthority) {
      ataMintTx.add(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          walletPublicKey,
          AuthorityType.MintTokens,
          null // null = revoke
        )
      );
    }

    onProgress({
      step: "minting_tokens",
      message: "Minting tokens to your wallet...",
      mintAddress,
    });

    const signedAtaMintTx = await signTransaction(ataMintTx);
    const mintToSignature = await connection.sendRawTransaction(
      signedAtaMintTx.serialize()
    );
    await connection.confirmTransaction(
      { signature: mintToSignature, blockhash: ataBlockhash, lastValidBlockHeight: ataLastValid },
      "confirmed"
    );

    onProgress({
      step: "success",
      message: revokeMintAuthority
        ? "Token launched & mint authority revoked ✓"
        : "Token launched successfully ✓",
      txSignature: mintToSignature,
      mintAddress,
    });

    return mintAddress;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    onProgress({
      step: "error",
      message,
      error: message,
    });
    throw error;
  }
}

/**
 * Fetch live SOL price from CoinGecko
 */
export async function getSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.solana?.usd ?? null;
  } catch {
    return null;
  }
}

/**
 * Format a public key for display (truncated)
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get Solscan URL for a mint address
 */
export function getSolscanUrl(address: string, network: "mainnet-beta" | "devnet"): string {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/token/${address}${cluster}`;
}

/**
 * Get Solscan TX URL
 */
export function getSolscanTxUrl(signature: string, network: "mainnet-beta" | "devnet"): string {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/tx/${signature}${cluster}`;
}
