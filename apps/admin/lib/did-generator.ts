import { type BrowserWallet, type DataSignature } from "@meshsdk/core";

interface Proof {
  address: string;
  signature: DataSignature;
  timestamp: number;
  nonce: string;
  did?: string;
  message?: string;
}

/**
 * Verify a DID proof
 * @param did The DID to verify
 * @returns A boolean indicating whether the DID is valid
 */
export async function verifyDidProof(did: string): Promise<boolean> {
  try {
    // Basic DID format validation
    if (!did || typeof did !== "string") {
      return false;
    }

    // Check if the DID follows the ION format
    if (!did.startsWith("did:ion:")) {
      return false;
    }

    // Extract the identifier part
    const identifier = did.split("did:ion:")[1];

    // Validate identifier format (should be a 32-character hex string)
    if (!/^[0-9a-fA-F]{32}$/.test(identifier)) {
      return false;
    }

    // TODO: Add more sophisticated verification if needed
    // For example, checking against a blockchain or verifying cryptographic signatures

    return true;
  } catch (error) {
    console.error("Error verifying DID proof:", error);
    return false;
  }
}

/**
 * Create a proof for a DID using wallet signature
 * @param wallet The wallet to use for signing
 * @param did The DID to create a proof for
 * @returns A Proof object containing the proof information
 */
export async function createDidProof(
  wallet: BrowserWallet,
  did: string
): Promise<Proof> {
  try {
    // Comprehensive wallet validation
    if (
      !wallet ||
      typeof wallet.getUsedAddresses !== "function" ||
      typeof wallet.signData !== "function"
    ) {
      throw new Error("Invalid wallet object. Missing required methods.");
    }

    // Get address
    let addresses;
    try {
      addresses = await wallet.getUsedAddresses();
      console.log("Got addresses:", addresses);
    } catch (addressError) {
      console.error("Error getting addresses:", addressError);
      throw new Error(
        `Failed to get addresses: ${addressError instanceof Error ? addressError.message : "Unknown error"}`
      );
    }

    if (!addresses || addresses.length === 0) {
      throw new Error("No addresses found in wallet");
    }

    const address = addresses[0];
    console.log("Using address:", address);

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = Date.now();

    const message = `Login to Genealogy App\nAddress: ${address}\nDID: ${did || "none"}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    try {
      const signature = await signDataWithWallet(wallet, message, address);

      const proof: Proof = {
        address,
        message,
        signature,
        did,
        timestamp,
        nonce,
      };

      console.log("Proof generated successfully:", proof);

      return proof;
    } catch (error) {
      console.error("Error generating proof:", error);
      throw new Error(
        `Failed to generate proof: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Error in createDidProof:", error);
    // Provide more detailed error info
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : String(error);

    throw new Error(
      `Failed to create DID proof: ${JSON.stringify(errorDetails)}`
    );
  }
}

/**
 * Signs data with a wallet
 * @param wallet The wallet to use for signing
 * @param message The message to sign
 * @param address The address to sign with
 * @returns The signature
 */
async function signDataWithWallet(
  wallet: BrowserWallet,
  message: string,
  address: string
): Promise<DataSignature> {
  try {
    return await wallet.signData(Buffer.from(message).toString("hex"), address);
  } catch (signError) {
    console.error("Error signing data:", signError);
    // Provide more detailed error info
    const errorDetails =
      signError instanceof Error
        ? { message: signError.message, stack: signError.stack }
        : String(signError);

    throw new Error(
      `Failed to sign data with wallet: ${JSON.stringify(errorDetails)}`
    );
  }
}

/**
 * Generate a new DID using the ION method
 * @returns An object containing the newly generated DID and its type
 */
export async function generateNewDid(walletAddress: string): Promise<{
  did: string;
  didType: string;
}> {
  try {
    // Generate a random identifier for the DID
    const randomId = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // Create a DID using the ION method
    const did = `did:ion:${walletAddress.substring(0, 16)}`;

    return {
      did,
      didType: "ION",
    };
  } catch (error) {
    console.error("Error generating DID:", error);
    throw new Error(
      `Failed to generate DID: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
