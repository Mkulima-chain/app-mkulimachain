import { BrowserWallet, Transaction } from "@meshsdk/core";
import { NFT } from "@/types/nft";

/**
 * Service pour acheter des NFTs avec Mesh SDK
 */
export class NFTPurchaseService {
  /**
   * Acheter un NFT sur Cardano avec Mesh SDK
   *
   * @param wallet - Le wallet BrowserWallet connecté
   * @param nft - Le NFT à acheter
   * @param sellerAddress - L'adresse du vendeur (créateur du NFT)
   * @param blockfrostApiKey - Clé API Blockfrost (optionnel, depuis env si non fourni)
   */
  static async purchaseNFT(
    wallet: BrowserWallet,
    nft: NFT,
    sellerAddress: string,
    blockfrostApiKey?: string
  ): Promise<{ txHash: string }> {
    try {
      // Récupérer l'API key Blockfrost depuis l'environnement si non fournie
      const apiKey =
        blockfrostApiKey ||
        (typeof window !== "undefined"
          ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
          : undefined);

      if (!apiKey) {
        throw new Error(
          "Blockfrost API key is required. Set NEXT_PUBLIC_BLOCKFROST_API_KEY in your .env file"
        );
      }

      // Récupérer les UTXOs pour vérifier le solde
      const utxos = await wallet.getUtxos();

      // Vérifier que le wallet a suffisamment d'ADA
      const totalLovelace = utxos.reduce(
        (sum, utxo) => sum + Number(utxo.output.amount[0]?.quantity || 0),
        0
      );
      const priceInLovelace = Number(nft.priceADA || 0) * 1_000_000; // Convertir ADA en Lovelace

      if (totalLovelace < priceInLovelace) {
        throw new Error(
          `Fonds insuffisants. Vous avez ${(totalLovelace / 1_000_000).toFixed(2)} ADA, mais ${nft.priceADA} ADA sont requis.`
        );
      }

      // Créer la transaction de paiement
      // Envoi d'ADA au vendeur
      // Note: Transaction est utilisé pour les paiements simples
      const tx = new Transaction({ initiator: wallet }).sendLovelace(
        sellerAddress,
        priceInLovelace.toString()
      );

      const unsignedTx = await tx.build();

      // Signer et soumettre
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      return {
        txHash,
      };
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      throw new Error(
        `Erreur lors de l'achat: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    }
  }
}
