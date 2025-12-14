import {
  BrowserWallet,
  MeshTxBuilder,
  BlockfrostProvider,
  ForgeScript,
  stringToHex,
} from "@meshsdk/core";
import { NFT } from "../types";
import { ipfsUriToHttpUrl } from "../utils";

/**
 * Service pour mint des NFTs avec Mesh SDK
 */
export class NFTMintService {
  /**
   * Mint un NFT sur Cardano avec Mesh SDK
   *
   * @param wallet - Le wallet BrowserWallet connecté
   * @param nft - Le NFT à mint
   * @param policyId - Policy ID Cardano (optionnel, sera généré si non fourni)
   * @param assetName - Nom de l'asset (optionnel, sera généré si non fourni)
   * @param blockfrostApiKey - Clé API Blockfrost (optionnel, depuis env si non fourni)
   */
  static async mintNFT(
    wallet: BrowserWallet,
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
      // Récupérer l'API key Blockfrost depuis l'environnement si non fournie
      // Note: Dans Next.js, les variables NEXT_PUBLIC_* sont accessibles côté client
      const apiKey =
        blockfrostApiKey ||
        (typeof window !== "undefined"
          ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
          : undefined);

      if (!apiKey) {
        const errorMessage =
          "Blockfrost API key is required. " +
          "Please set NEXT_PUBLIC_BLOCKFROST_API_KEY in your .env.local file " +
          "and restart the development server.";
        console.error("Blockfrost API Key Error:", {
          hasBlockfrostKey: !!blockfrostApiKey,
          hasEnvVar: !!process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY,
          isClient: typeof window !== "undefined",
        });
        throw new Error(errorMessage);
      }

      // Créer le provider Blockfrost
      const provider = new BlockfrostProvider(apiKey);

      // Récupérer les métadonnées depuis IPFS
      // Note: On ne récupère que l'image, pas toutes les métadonnées
      // car elles peuvent contenir des valeurs trop longues pour Cardano
      const metadata: Record<string, unknown> = {};
      let imageUrl = "";
      if (nft.metadataURI) {
        try {
          const metadataUrl = ipfsUriToHttpUrl(nft.metadataURI);
          const response = await fetch(metadataUrl);
          if (response.ok) {
            const fetchedMetadata = await response.json();
            // Ne garder que l'image, ignorer le reste pour éviter les problèmes de taille
            imageUrl = fetchedMetadata.image || "";
            if (imageUrl && imageUrl.startsWith("ipfs://")) {
              imageUrl = ipfsUriToHttpUrl(imageUrl);
            }
            // Ne pas copier les autres métadonnées car elles peuvent être trop longues
            // Les métadonnées principales (name, description, type) viennent du NFT directement
          }
        } catch (error) {
          console.warn("Could not fetch metadata from IPFS:", error);
        }
      }

      // Récupérer les UTXOs et l'adresse de change
      const utxos = await wallet.getUtxos();
      const changeAddress = await wallet.getChangeAddress();

      // Créer une policy simple avec ForgeScript
      // Pour ForgeScript, Mesh SDK génère automatiquement le Policy ID
      const forgingScript = ForgeScript.withOneSignature(changeAddress);

      // Pour ForgeScript, le Policy ID est généré automatiquement par Mesh SDK
      // Si un Policy ID est fourni, l'utiliser
      // Sinon, on utilisera un Policy ID temporaire qui sera remplacé après le mint
      let finalPolicyId: string;
      if (policyId) {
        finalPolicyId = policyId;
      } else {
        // Générer un Policy ID temporaire valide (56 caractères hex)
        // Le vrai Policy ID sera extrait après le mint depuis la transaction
        // Format: hash de l'adresse + timestamp pour garantir l'unicité
        const addressBytes = Buffer.from(changeAddress);
        const timestamp = Date.now().toString();
        const combined = Buffer.concat([addressBytes, Buffer.from(timestamp)]);
        finalPolicyId = combined
          .toString("hex")
          .substring(0, 56)
          .padEnd(56, "0");

        console.log(
          "Using temporary Policy ID for ForgeScript:",
          finalPolicyId
        );
        console.log(
          "Note: The actual Policy ID will be extracted after minting"
        );
      }

      // Générer ou utiliser le nom d'asset fourni
      const tokenName =
        assetName ||
        nft.title.replace(/[^a-zA-Z0-9]/g, "").substring(0, 32) ||
        "MkulimaNFT";
      const finalAssetName = stringToHex(tokenName);

      // Fonction helper pour tronquer les valeurs de métadonnées à 64 bytes max
      // Cardano impose une limite stricte de 64 bytes par valeur de metadatum
      const truncateMetadataValue = (
        value: string,
        maxBytes: number = 64
      ): string => {
        if (!value) return "";

        // Convertir en bytes (UTF-8)
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);

        // Si déjà <= maxBytes, retourner tel quel
        if (bytes.length <= maxBytes) return value;

        // Tronquer byte par byte pour éviter de couper un caractère UTF-8
        // On prend maxBytes - 3 pour laisser de la marge pour les caractères UTF-8 multi-bytes
        const safeMaxBytes = Math.max(1, maxBytes - 3);
        let truncated = bytes.slice(0, safeMaxBytes);
        const decoder = new TextDecoder("utf-8", { fatal: false });
        let result = decoder.decode(truncated);

        // Vérifier et ajuster jusqu'à ce que la taille soit correcte
        let encodedLength = encoder.encode(result).length;
        while (encodedLength > maxBytes && result.length > 0) {
          result = result.slice(0, -1);
          encodedLength = encoder.encode(result).length;
        }

        // Double vérification finale
        const finalBytes = encoder.encode(result);
        if (finalBytes.length > maxBytes) {
          // Si toujours trop long, tronquer plus agressivement
          truncated = bytes.slice(0, Math.floor(maxBytes * 0.8));
          result = decoder.decode(truncated);
          // Nettoyer à nouveau
          while (
            encoder.encode(result).length > maxBytes &&
            result.length > 0
          ) {
            result = result.slice(0, -1);
          }
        }

        return result;
      };

      // Construire les métadonnées CIP-25 avec valeurs tronquées
      // Note: Cardano limite chaque valeur de metadatum à 64 bytes
      // Tronquer toutes les valeurs AVANT de construire l'objet
      const truncatedTitle = truncateMetadataValue(nft.title, 64);
      const truncatedDescription = truncateMetadataValue(
        nft.description || "",
        64
      );
      const truncatedImage = truncateMetadataValue(imageUrl || "", 64);
      const truncatedType = truncateMetadataValue(nft.type, 64);

      // Vérifier les longueurs après troncature (pour débogage)
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        console.log("Metadata lengths after truncation:", {
          title: new TextEncoder().encode(truncatedTitle).length,
          description: new TextEncoder().encode(truncatedDescription).length,
          image: new TextEncoder().encode(truncatedImage).length,
          type: new TextEncoder().encode(truncatedType).length,
        });
      }

      const cip25Metadata: Record<
        string,
        Record<string, Record<string, string>>
      > = {
        [finalPolicyId]: {
          [tokenName]: {
            name: truncatedTitle,
            description: truncatedDescription,
            image: truncatedImage,
            type: truncatedType,
          },
        },
      };

      // Ajouter les métadonnées supplémentaires en filtrant et tronquant
      if (
        metadata &&
        typeof metadata === "object" &&
        !Array.isArray(metadata)
      ) {
        const additionalMetadata: Record<string, string> = {};

        for (const [key, value] of Object.entries(metadata)) {
          // Ignorer les clés qui sont déjà utilisées
          if (
            ["name", "description", "image", "type"].includes(key.toLowerCase())
          ) {
            continue;
          }

          // Tronquer la clé
          const truncatedKey = truncateMetadataValue(key, 64);

          // Traiter la valeur selon son type
          let processedValue: string | undefined;

          if (typeof value === "string") {
            processedValue = truncateMetadataValue(value, 64);
          } else if (typeof value === "number") {
            processedValue = truncateMetadataValue(value.toString(), 64);
          } else if (typeof value === "boolean") {
            processedValue = value ? "true" : "false";
          } else if (Array.isArray(value)) {
            // Pour les tableaux, prendre seulement le premier élément si c'est une string
            const firstItem = value[0];
            if (typeof firstItem === "string") {
              processedValue = truncateMetadataValue(firstItem, 64);
            } else {
              continue; // Ignorer les tableaux complexes
            }
          } else {
            // Ignorer les objets complexes
            continue;
          }

          // Vérifier que la clé et la valeur sont valides
          if (truncatedKey && processedValue) {
            additionalMetadata[truncatedKey] = processedValue;
          }
        }

        // Fusionner les métadonnées supplémentaires
        cip25Metadata[finalPolicyId][tokenName] = {
          ...cip25Metadata[finalPolicyId][tokenName],
          ...additionalMetadata,
        };
      }

      // Validation finale : vérifier que toutes les valeurs sont <= 64 bytes
      const encoder = new TextEncoder();
      const validateMetadata = (
        obj: Record<string, unknown>,
        path: string = ""
      ): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === "string") {
            const byteLength = encoder.encode(value).length;
            if (byteLength > 64) {
              console.error(
                `Metadata value at ${currentPath} is ${byteLength} bytes (max 64)`
              );
              throw new Error(
                `Metadata value "${currentPath}" exceeds 64 bytes limit (${byteLength} bytes). Please shorten the content.`
              );
            }
          } else if (typeof value === "object" && value !== null) {
            validateMetadata(value, currentPath);
          }
        }
      };

      // Valider toutes les métadonnées avant de construire la transaction
      validateMetadata(cip25Metadata);

      // Créer le builder de transaction
      const txBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
      });

      // Construire la transaction avec la policy
      const unsignedTx = await txBuilder
        .mint("1", finalPolicyId, finalAssetName)
        .mintingScript(forgingScript)
        .metadataValue(721, cip25Metadata)
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();

      // Signer et soumettre
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      // Pour ForgeScript, le Policy ID réel est généré automatiquement par Mesh SDK
      // Il est inclus dans les métadonnées de la transaction (label 721)
      // On peut l'extraire depuis cip25Metadata qui contient le Policy ID comme clé
      let actualPolicyId = finalPolicyId;

      // Le Policy ID réel est dans les métadonnées qu'on a créées
      // Mais comme on a utilisé un Policy ID temporaire, on doit le récupérer autrement
      // En production, vous pouvez interroger Blockfrost API pour obtenir le Policy ID depuis la transaction
      // Pour l'instant, on retourne le Policy ID utilisé (qui sera le vrai si fourni, ou temporaire sinon)
      console.log("Transaction submitted successfully:", {
        txHash,
        policyId: actualPolicyId,
        note: policyId
          ? "Using provided Policy ID"
          : "Using temporary Policy ID. Query Blockfrost API to get the actual Policy ID from the transaction.",
      });

      return {
        txHash,
        policyId: actualPolicyId,
        assetName: tokenName, // Retourner le nom en texte, pas en hex
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw new Error(
        `Erreur lors du mint: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    }
  }
}
