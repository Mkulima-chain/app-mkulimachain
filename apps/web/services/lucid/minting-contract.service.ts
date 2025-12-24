import { Lucid, Data, fromText, toUnit, MintingPolicy } from "lucid-cardano";
import { VALIDATOR_CODES } from "@/lib/contract-codes";

export interface NFTMetadata {
  name: string;
  image: string;
  description?: string;
  mediaType?: string;
  [key: string]: any;
}

export class MintingContractService {
  private lucid: Lucid;
  private mintingPolicy: MintingPolicy;
  private policyId: string;

  constructor(lucid: Lucid) {
    this.lucid = lucid;
    this.mintingPolicy = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.MINTING_POLICY,
    };
    this.policyId = lucid.utils.mintingPolicyToId(this.mintingPolicy);
    console.log("Minting Policy ID:", this.policyId);
    console.log(
      "Minting Script (First 20 chars):",
      this.mintingPolicy.script.substring(0, 20)
    );
  }

  getPolicyId(): string {
    return this.policyId;
  }

  /**
   * Mint a new NFT using the smart contract policy
   */
  async mintNFT(
    assetNameString: string,
    metadata: NFTMetadata
  ): Promise<{ txHash: string; policyId: string; assetName: string }> {
    const address = await this.lucid.wallet.address();
    const assetName = fromText(assetNameString);
    const unit = toUnit(this.policyId, assetName);

    const pkh = this.lucid.utils.paymentCredentialOf(address).hash;

    const cip25Metadata = {
      [this.policyId]: {
        [assetNameString]: {
          ...metadata,
          name: metadata.name,
          image: metadata.image,
          mediaType: metadata.mediaType || "image/jpeg",
        },
      },
    };

    const redeemer = Data.to([assetName]);
    const tx = await this.lucid
      .newTx()
      .mintAssets({ [unit]: 1n }, redeemer)
      .attachMintingPolicy(this.mintingPolicy)
      .attachMetadata(721, cip25Metadata)
      .addSignerKey(pkh)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return {
      txHash,
      policyId: this.policyId,
      assetName: assetNameString,
    };
  }
}
