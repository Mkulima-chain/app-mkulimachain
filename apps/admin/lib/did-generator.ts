import { Lucid, fromText } from "lucid-cardano";

export interface DataSignature {
  signature: string;
  key: string;
}

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
 * @param lucid The Lucid instance to use for signing
 * @param did The DID to create a proof for
 * @returns A Proof object containing the proof information
 */
export async function createDidProof(
  lucid: Lucid,
  did: string
): Promise<Proof> {
  try {
    // Gets default address (already selected in Lucid)
    const address = await lucid.wallet.address();
    console.log("Using address:", address);

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = Date.now();

    const message = `Login to Genealogy App\nAddress: ${address}\nDID: ${did || "none"}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    // Encode message to hex
    const messageHex = fromText(message);

    try {
      const signature = await lucid.wallet.signMessage(address, messageHex);

      // Lucid matches the DataSignature interface { signature, key }
      // but let's ensure it cast properly if needed, although standard CIP-30 returns this structure.
      const proof: Proof = {
        address,
        message,
        signature: signature as DataSignature,
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
