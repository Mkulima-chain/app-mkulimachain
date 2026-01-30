import { Lucid, fromText } from "lucid-cardano";
import { NFT } from "../types";

/**
 * Service pour mint des NFTs avec Lucid
 */
export class NFTMintService {
  /**
   * Mint un NFT sur Cardano avec Lucid
   *
   * @param lucid - L'instance Lucid connectée
   * @param nft - Le NFT à mint
   * @param policyId - Policy ID Cardano (optionnel, ignoré car généré par le script actuel)
   * @param assetName - Nom de l'asset (optionnel, sera généré si non fourni)
   * @param blockfrostApiKey - Clé API Blockfrost (plus nécessaire si Lucid est init)
   */
  static async mintNFT(
    lucid: Lucid,
    nft: NFT,
    policyId?: string,
    assetName?: string,
    blockfrostApiKey?: string
  ): Promise<{
    txHash: string;
    policyId: string;
    assetName: string;
  }> {
    try {
      console.log("MINT_DEBUG [1]: Getting wallet address");
      const address = await lucid.wallet.address();
      console.log("MINT_DEBUG [2]: Address obtained:", address);

      console.log("MINT_DEBUG [3]: Fetching address details");
      let paymentCredential;
      try {
        const details = lucid.utils.getAddressDetails(address);
        paymentCredential = details.paymentCredential;
        console.log(
          "MINT_DEBUG [4]: Credential hash:",
          paymentCredential?.hash
        );
      } catch (e) {
        console.error("MINT_DEBUG [E4]: getAddressDetails failed:", e);
        throw e;
      }

      if (!paymentCredential) throw new Error("No payment credential found");

      console.log("MINT_DEBUG [5]: Creating simple policy");
      let mintingPolicy;
      try {
        mintingPolicy = lucid.utils.nativeScriptFromJson({
          type: "all",
          scripts: [{ type: "sig", keyHash: paymentCredential.hash }],
        });
        console.log("MINT_DEBUG [6]: Policy created");
      } catch (e) {
        console.error("MINT_DEBUG [E6]: nativeScriptFromJson failed:", e);
        throw e;
      }

      console.log("MINT_DEBUG [7]: Computing policy ID");
      let actualPolicyId;
      try {
        actualPolicyId = lucid.utils.mintingPolicyToId(mintingPolicy);
        console.log("MINT_DEBUG [8]: Policy ID:", actualPolicyId);
      } catch (e) {
        console.error("MINT_DEBUG [E8]: mintingPolicyToId failed:", e);
        throw e;
      }

      const tokenNameStr =
        assetName ||
        nft.title.replace(/[^a-zA-Z0-9]/g, "").substring(0, 32) ||
        "MkulimaNFT";
      const unit = actualPolicyId + fromText(tokenNameStr);
      console.log("MINT_DEBUG [9]: Unit:", unit);

      // Skip image/metadata fetching for now to isolate WASM issue
      const metadata = {
        [actualPolicyId]: {
          [tokenNameStr]: {
            name: nft.title.substring(0, 60),
            description: (nft.description || "").substring(0, 60),
            image: "ipfs://",
          },
        },
      };

      console.log("MINT_DEBUG [10]: Starting transaction");
      try {
        const tx = await lucid
          .newTx()
          .mintAssets({ [unit]: BigInt(1) })
          .attachMintingPolicy(mintingPolicy)
          .attachMetadata(721, metadata)
          .complete();
        console.log("MINT_DEBUG [11]: Transaction completed successfully");

        const signedTx = await tx.sign().complete();
        console.log("MINT_DEBUG [12]: Transaction signed");

        const txHash = await signedTx.submit();
        console.log("MINT_DEBUG [13]: Transaction submitted:", txHash);

        return {
          txHash,
          policyId: actualPolicyId,
          assetName: tokenNameStr,
        };
      } catch (e) {
        console.error("MINT_DEBUG [E10-13]: Transaction flow failed:", e);
        throw e;
      }
    } catch (error) {
      console.error("Error minting NFT with Lucid (catch-all):", error);
      throw new Error(
        `Erreur lors du mint: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    }
  }
}
