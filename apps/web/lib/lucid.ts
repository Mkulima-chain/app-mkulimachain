import { Blockfrost, Lucid, Network } from "lucid-cardano";

/**
 * Contract compiled codes (CBOR hex)
 * These will be extracted from contracts/plutus.json
 */
export const CONTRACT_CODES = {
  // TODO: Extract these from plutus.json after compilation
  ORDER_VALIDATOR: process.env.NEXT_PUBLIC_ORDER_VALIDATOR_CODE || "",
  LOAN_VALIDATOR: process.env.NEXT_PUBLIC_LOAN_VALIDATOR_CODE || "",
  ESCROW_VALIDATOR: process.env.NEXT_PUBLIC_ESCROW_VALIDATOR_CODE || "",
  AUTH_VALIDATOR: process.env.NEXT_PUBLIC_AUTH_VALIDATOR_CODE || "",
  // Existing contracts
  SALE_VALIDATOR: process.env.NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE || "",
  MINTING_POLICY: process.env.NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE || "",
};

/**
 * Network configuration
 */
export const NETWORK: Network =
  (process.env.NEXT_PUBLIC_CARDANO_NETWORK as Network) || "Preprod";

/**
 * Blockfrost configuration
 */
const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";
const BLOCKFROST_URL =
  NETWORK === "Mainnet"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : "https://cardano-preprod.blockfrost.io/api/v0";

/**
 * Initialize Lucid instance with Blockfrost provider
 * @throws Error if Blockfrost API key is missing or initialization fails
 */
export async function initLucid(): Promise<Lucid> {
  // Validate Blockfrost API key
  if (!BLOCKFROST_API_KEY) {
    console.error(
      "Blockfrost API key is missing. Please set NEXT_PUBLIC_BLOCKFROST_API_KEY in your .env.local file"
    );
    throw new Error(
      "Blockfrost API key is required. Set NEXT_PUBLIC_BLOCKFROST_API_KEY in your .env.local file.\n\n" +
        "To get a free API key:\n" +
        "1. Go to https://blockfrost.io/\n" +
        "2. Create a free account\n" +
        "3. Create a new project for 'Cardano Preprod'\n" +
        "4. Copy the API key to your .env.local file"
    );
  }

  // Validate API key format (Blockfrost keys start with 'preprod' or 'mainnet' or 'preview')
  const validPrefixes = ["preprod", "mainnet", "preview", "testnet"];
  const hasValidPrefix = validPrefixes.some((prefix) =>
    BLOCKFROST_API_KEY.startsWith(prefix)
  );
  if (!hasValidPrefix) {
    console.warn(
      "Warning: Blockfrost API key may be invalid. Expected format: 'preprod...' or 'mainnet...'"
    );
  }

  try {
    console.log(
      `Initializing Lucid with network: ${NETWORK}, Blockfrost URL: ${BLOCKFROST_URL}`
    );

    const lucid = await Lucid.new(
      new Blockfrost(BLOCKFROST_URL, BLOCKFROST_API_KEY),
      NETWORK
    );

    console.log("Lucid initialized successfully");
    return lucid;
  } catch (error: any) {
    console.error("Failed to initialize Lucid:", error);

    // Provide more helpful error messages
    if (error.message?.includes("hex") || error.message?.includes("encoding")) {
      throw new Error(
        "Invalid Blockfrost API key format. The key should look like:\n" +
          "preprodXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n" +
          "Please check your NEXT_PUBLIC_BLOCKFROST_API_KEY in .env.local\n" +
          "Get a free key at: https://blockfrost.io/"
      );
    }

    if (
      error.message?.includes("zeroTime") ||
      error.message?.includes("undefined")
    ) {
      throw new Error(
        "Failed to connect to Cardano network. This usually means:\n" +
          "1. Your Blockfrost API key is invalid or expired\n" +
          "2. The network configuration doesn't match your API key\n" +
          "3. Blockfrost service is temporarily unavailable\n\n" +
          "Please verify your NEXT_PUBLIC_BLOCKFROST_API_KEY is correct."
      );
    }

    throw error;
  }
}

/**
 * Connect wallet to Lucid
 * @param lucid Lucid instance
 * @param walletApi Wallet API (from window.cardano)
 */
export async function connectWallet(
  lucid: Lucid,
  walletApi: any
): Promise<Lucid> {
  lucid.selectWallet(walletApi);
  return lucid;
}

/**
 * Get wallet address
 */
export async function getWalletAddress(lucid: Lucid): Promise<string> {
  return await lucid.wallet.address();
}

/**
 * Get wallet UTxOs
 */
export async function getWalletUtxos(lucid: Lucid) {
  return await lucid.wallet.getUtxos();
}

/**
 * Convert ADA to Lovelace
 */
export function adaToLovelace(ada: number): bigint {
  return BigInt(Math.floor(ada * 1_000_000));
}

/**
 * Convert Lovelace to ADA
 */
export function lovelaceToAda(lovelace: bigint): number {
  return Number(lovelace) / 1_000_000;
}

/**
 * Validate contract code (hex string)
 */
export function validateContractCode(code: string): boolean {
  return /^[0-9a-fA-F]+$/.test(code) && code.length > 0;
}

/**
 * Get contract codes with validation
 */
export function getContractCodes() {
  const codes = {
    orderValidator: CONTRACT_CODES.ORDER_VALIDATOR,
    loanValidator: CONTRACT_CODES.LOAN_VALIDATOR,
    escrowValidator: CONTRACT_CODES.ESCROW_VALIDATOR,
    authValidator: CONTRACT_CODES.AUTH_VALIDATOR,
  };

  // Validate all codes
  Object.entries(codes).forEach(([name, code]) => {
    if (!code) {
      console.warn(`Warning: ${name} code is not set`);
    } else if (!validateContractCode(code)) {
      throw new Error(`Invalid ${name} code format`);
    }
  });

  return codes;
}

/**
 * Platform fee address (should be configured)
 */
export const PLATFORM_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || "addr_test1qz..."; // TODO: Set your platform address

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(
  totalLovelace: bigint,
  feePercent: number
): bigint {
  return (totalLovelace * BigInt(feePercent)) / BigInt(100);
}

/**
 * Calculate seller amount after platform fee
 */
export function calculateSellerAmount(
  totalLovelace: bigint,
  feePercent: number
): bigint {
  return totalLovelace - calculatePlatformFee(totalLovelace, feePercent);
}
