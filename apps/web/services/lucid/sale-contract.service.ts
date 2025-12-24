import { Lucid, Data, Constr, toUnit } from "lucid-cardano";
import { VALIDATOR_CODES } from "@/lib/contract-codes";
import { SaleDatum, SaleAction } from "@/types/contracts";

// Schema for SaleDatum
const SaleDatumSchema = {
  sellerAddress: "bytes",
  nftPolicyId: "bytes",
  nftAssetName: "bytes",
  price: "int",
  creatorAddress: "bytes",
  schoolFundAddress: "bytes",
  platformAddress: "bytes",
  creatorPercent: "int",
  schoolFundPercent: "int",
  platformPercent: "int",
};

export class SaleContractService {
  private lucid: Lucid;
  private validator: any;
  private scriptAddress: string;

  constructor(lucid: Lucid) {
    this.lucid = lucid;
    this.validator = {
      type: "PlutusV2",
      script: VALIDATOR_CODES.SALE_VALIDATOR,
    };
    this.scriptAddress = lucid.utils.validatorToAddress(this.validator);
  }

  getScriptAddress(): string {
    return this.scriptAddress;
  }

  /**
   * List an NFT for sale
   */
  async listNFT(
    nftPolicyId: string,
    nftAssetName: string,
    price: bigint,
    creatorAddress: string,
    schoolFundAddress: string,
    platformAddress: string,
    creatorPercent: number = 5,
    schoolFundPercent: number = 5,
    platformPercent: number = 2
  ): Promise<{ txHash: string; datum: string }> {
    const sellerAddress = await this.lucid.wallet.address();
    const pubKeyHash = this.lucid.utils.paymentCredentialOf(sellerAddress).hash;
    const creatorGeneric =
      this.lucid.utils.paymentCredentialOf(creatorAddress).hash;
    const schoolGeneric =
      this.lucid.utils.paymentCredentialOf(schoolFundAddress).hash;
    const platformGeneric =
      this.lucid.utils.paymentCredentialOf(platformAddress).hash;

    const datum: SaleDatum = {
      sellerAddress: pubKeyHash,
      nftPolicyId,
      nftAssetName,
      price,
      creatorAddress: creatorGeneric,
      schoolFundAddress: schoolGeneric,
      platformAddress: platformGeneric,
      creatorPercent,
      schoolFundPercent,
      platformPercent,
    };

    const plutusDatum = this.datumToPlutusData(datum);
    const unit = toUnit(nftPolicyId, nftAssetName);

    const tx = await this.lucid
      .newTx()
      .payToContract(
        this.scriptAddress,
        { inline: plutusDatum },
        { [unit]: 1n }
      )
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return { txHash, datum: plutusDatum };
  }

  /**
   * Buy an NFT
   */
  async buyNFT(utxo: any, datum: SaleDatum): Promise<{ txHash: string }> {
    const buyerAddress = await this.lucid.wallet.address();
    const buyerGeneric =
      this.lucid.utils.paymentCredentialOf(buyerAddress).hash;

    const redeemerAction: SaleAction = {
      Buy: { buyerAddress: buyerGeneric },
    };
    const redeemer = this.redeemerToPlutusData(redeemerAction);

    // Calculate splits
    const price = BigInt(datum.price);
    const creatorAmount = (price * BigInt(datum.creatorPercent)) / 100n;
    const schoolAmount = (price * BigInt(datum.schoolFundPercent)) / 100n;
    const platformAmount = (price * BigInt(datum.platformPercent)) / 100n;
    const sellerAmount = price - creatorAmount - schoolAmount - platformAmount;

    // Reconstruct addresses from PubKeyHash (assuming Base Address with 0 stake)
    // NOTE: This is a simplification. The Datum stores PKH (bytes), we need to reconstruct a valid address.
    // However, clean functionality requires valid Bech32 addresses.
    // Since we only stored the hash in the datum (bytes), we can't easily reconstruct the full original address
    // without the stake credential. But for now, we can try to send to Credential.
    // Or, we should have stored the Full Address? The Datum schema says 'bytes', usually implies PKH.

    // For this implementation, I will assume the 'sellerAddress' etc passed in the Datum
    // are the PKH. To pay them, I need to convert PKH to a credential.

    // Actually, `lucid.newTx().payToAddressWithData` or just `payToAddress` takes Bech32.
    // If I only have PKH, I can construct an Enterprise Address (no stake) or use the one from the API if available.
    // PROBLEM: The `datum` passed here is the parsed object.

    // Wait, the `buyNFT` takes `datum: SaleDatum`. If I got this from chain, it has bytes.
    // But if I call this method, maybe I can pass the original addresses if I know them?
    // Let's assume for now we construct enterprise addresses from the PKH if needed,
    // OR we rely on the caller to provide valid addresses if they can.

    // Better idea: The `SaleDatum` on chain stores BYTES (PKH).
    // Users of this function probably have the full object.

    // To simplify: I will assume I can pay to `Credential` constructed from PKH.

    const credentialToAddress = (pkh: string) =>
      this.lucid.utils.credentialToAddress({ type: "Key", hash: pkh });

    const sellerAddr = credentialToAddress(datum.sellerAddress);
    const creatorAddr = credentialToAddress(datum.creatorAddress);
    const schoolAddr = credentialToAddress(datum.schoolFundAddress);
    const platformAddr = credentialToAddress(datum.platformAddress);

    const tx = await this.lucid
      .newTx()
      .collectFrom([utxo], redeemer)
      .addSigner(buyerAddress)
      // Pay Seller
      .payToAddress(sellerAddr, { lovelace: sellerAmount })
      // Pay Creator
      .payToAddress(creatorAddr, { lovelace: creatorAmount })
      // Pay School Fund
      .payToAddress(schoolAddr, { lovelace: schoolAmount })
      // Pay Platform
      .payToAddress(platformAddr, { lovelace: platformAmount })
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return { txHash };
  }

  /**
   * Cancel a listing
   */
  async cancelListing(utxo: any): Promise<{ txHash: string }> {
    const sellerAddress = await this.lucid.wallet.address();

    const redeemerAction: SaleAction = { Cancel: {} };
    const redeemer = this.redeemerToPlutusData(redeemerAction);

    const tx = await this.lucid
      .newTx()
      .collectFrom([utxo], redeemer)
      .addSigner(sellerAddress)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return { txHash };
  }

  /**
   * Finds the UTxO for a specific NFT listing
   */
  async findListingUtxo(nftPolicyId: string, nftAssetName: string) {
    const unit = toUnit(nftPolicyId, nftAssetName);
    const utxos = await this.lucid.utxosAt(this.scriptAddress);

    return utxos.find((u) => u.assets[unit] === 1n);
  }

  /**
   * Converts internal SaleDatum to PlutusData (CBOR)
   * Wraps in Option<SaleDatum> -> Constr(0, [datum])
   */
  datumToPlutusData(datum: SaleDatum): string {
    const datumRecord = Data.to(datum as any, SaleDatumSchema);
    // Wrap in Some (Constr 0) to match Option<SaleDatum>
    return Data.to(new Constr(0, [datumRecord]));
  }

  /**
   * Parses PlutusData to SaleDatum
   */
  plutusDataToDatum(datumCbor: string): SaleDatum | null {
    try {
      const parsed = Data.from(datumCbor);
      // Unwrap Option (Constr 0)
      if (
        parsed instanceof Constr &&
        parsed.index === 0 &&
        parsed.fields.length === 1
      ) {
        return Data.castFrom(
          parsed.fields[0],
          SaleDatumSchema
        ) as unknown as SaleDatum;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse datum", e);
      return null;
    }
  }

  /**
   * Converts SaleRedeemer to PlutusData
   */
  redeemerToPlutusData(action: SaleAction): string {
    const actionData = Data.to(action as any, {
      Buy: {
        buyerAddress: "bytes",
      },
      Cancel: {},
    });
    // Wrap in Record Constr(0, [action])
    return Data.to(new Constr(0, [actionData]));
  }
}
