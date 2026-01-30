import { Lucid } from "lucid-cardano";
import { NFT } from "@/types/nft";
import { SaleContractService } from "./lucid/sale-contract.service";

// Adresses de la plateforme et du fonds d'éducation (Placeholders pour la démo)
const PLATFORM_ADDRESS =
  "addr_test1qpg46968888888888888888888888888888888888888888888888888888888888888888888888888888888888abc";
const SCHOOL_FUND_ADDRESS =
  "addr_test1qpg46967777777777777777777777777777777777777777777777777777777777777777777777777777777777xyz";

/**
 * Service pour acheter des NFTs avec Lucid-Cardano
 */
export class NFTPurchaseService {
  /**
   * Acheter un NFT sur Cardano avec Lucid
   *
   * @param lucid - L'instance Lucid connectée
   * @param nft - Le NFT à acheter
   * @param sellerAddress - L'adresse du vendeur (créateur du NFT)
   */
  static async purchaseNFT(
    lucid: Lucid,
    nft: NFT,
    sellerAddress: string
  ): Promise<{ txHash: string }> {
    try {
      // 1. Tenter l'achat via Smart Contract si le NFT est listé on-chain
      if (nft.policyId && nft.assetName) {
        try {
          const saleService = new SaleContractService(lucid);
          const listingUtxo = await saleService.findListingUtxo(
            nft.policyId,
            nft.assetName
          );

          if (listingUtxo && listingUtxo.datum) {
            console.log(
              "Found on-chain listing for NFT, using Smart Contract..."
            );
            const datum = saleService.plutusDataToDatum(
              listingUtxo.datum as string
            );
            if (datum) {
              return await saleService.buyNFT(listingUtxo, datum);
            }
          }
        } catch (contractError) {
          console.warn(
            "Smart Contract purchase failed, falling back to direct transfer:",
            contractError
          );
        }
      }

      // 2. Fallback: Transfert direct avec répartition des revenus (simulé/off-chain listing)
      console.log("Using direct transfer with revenue split...");

      // Get UTxOs to check balance
      const utxos = await lucid.wallet.getUtxos();
      const totalLovelace = utxos.reduce(
        (sum, utxo) => sum + (utxo.assets.lovelace || 0n),
        0n
      );
      const priceInLovelace = BigInt(
        Math.floor((nft.priceADA || 0) * 1_000_000)
      );

      if (totalLovelace < priceInLovelace) {
        throw new Error(
          `Fonds insuffisants. Vous avez ${(Number(totalLovelace) / 1_000_000).toFixed(2)} ₳, mais ${nft.priceADA} ₳ sont requis.`
        );
      }

      // Calcul des répartitions
      const schoolPercent = BigInt(
        Math.floor(nft.revenueDistribution?.schoolFundPercent || 0)
      );
      const platformPercent = BigInt(
        Math.floor(nft.revenueDistribution?.platformPercent || 0)
      );
      // Le reste va au vendeur (créateur)

      const schoolAmount = (priceInLovelace * schoolPercent) / 100n;
      const platformAmount = (priceInLovelace * platformPercent) / 100n;
      const sellerAmount = priceInLovelace - schoolAmount - platformAmount;

      // Build the payment transaction
      let tx = lucid.newTx();

      // Paiement au vendeur
      tx = tx.payToAddress(sellerAddress, { lovelace: sellerAmount });

      // Paiement au fonds école (si > 0)
      if (schoolAmount > 0n) {
        // Utiliser une adresse valide pour la démo si non fournie
        tx = tx.payToAddress(SCHOOL_FUND_ADDRESS, { lovelace: schoolAmount });
      }

      // Paiement plateforme (si > 0)
      if (platformAmount > 0n) {
        tx = tx.payToAddress(PLATFORM_ADDRESS, { lovelace: platformAmount });
      }

      const txComplete = await tx.complete();

      // Sign and submit
      const signedTx = await txComplete.sign().complete();
      const txHash = await signedTx.submit();

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
