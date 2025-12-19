import {
  BrowserWallet,
  MeshTxBuilder,
  BlockfrostProvider,
  Asset,
  UTxO,
  mConStr0,
  mConStr1,
  stringToHex,
  deserializeAddress,
  resolvePlutusScriptAddress,
  PlutusScript,
} from "@meshsdk/core";
import { NFT } from "../types/nft";
import { PaymentService } from "./payment.service";

/**
 * Service to manage Escrow transactions using the sale_validator contract.
 * Supports: Initiate (List), Complete (Buy), Cancel.
 */
export class EscrowService {
  private static getProvider() {
    const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Blockfrost API key is required. Set NEXT_PUBLIC_BLOCKFROST_API_KEY."
      );
    }
    return new BlockfrostProvider(apiKey);
  }

  private static getContractCode() {
    const code = process.env.NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE;
    if (!code) {
      throw new Error(
        "Contract code is missing. Set NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE."
      );
    }
    // Simple hex validation
    if (!/^[0-9a-fA-F]+$/.test(code)) {
      throw new Error("Invalid contract code format (must be hex string).");
    }
    return code;
  }

  /**
   * Initiate Escrow (List NFT for Sale)
   * Locks the NFT at the script address with the SaleDatum.
   */
  static async initiateEscrow(
    wallet: BrowserWallet,
    nft: NFT,
    priceADA: number,
    beneficiaries: {
      creator: string;
      schoolFund: string;
      platform: string;
      creatorPercent: number;
      schoolFundPercent: number;
      platformPercent: number;
    }
  ) {
    if (!nft.policyId || !nft.assetName) {
      throw new Error(
        "NFT must be minted (have policyId and assetName) before listing."
      );
    }

    const provider = this.getProvider();
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
      evaluator: provider,
    });

    const scriptCode = this.getContractCode();
    const script: PlutusScript = {
      code: scriptCode,
      version: "V2",
    };

    // Calculate script address
    // 0 = Testnet, 1 = Mainnet.
    // Ideally we detect network from wallet.
    const networkId = await wallet.getNetworkId(); // 0 or 1
    const scriptAddress = resolvePlutusScriptAddress(script, networkId);

    // Construct Datum
    // SaleDatum { ... }
    const sellerAddress = await wallet.getChangeAddress();
    const sellerPkh = deserializeAddress(sellerAddress).pubKeyHash;
    const creatorPkh = deserializeAddress(beneficiaries.creator).pubKeyHash;
    const schoolPkh = deserializeAddress(beneficiaries.schoolFund).pubKeyHash;
    const platformPkh = deserializeAddress(beneficiaries.platform).pubKeyHash;

    // Convert price to Lovelace
    const priceLovelace = PaymentService.adaToLovelace(priceADA);

    // Build the instruction for the Datum
    // Note: The order must match the Aiken struct exactly.
    // SaleDatum { seller, policy, asset_name, price, creator, school, platform, c_%, s_%, p_% }
    const datum = {
      alternative: 0,
      fields: [
        sellerPkh, // seller_address (bytes)
        nft.policyId, // nft_policy_id (bytes)
        stringToHex(nft.assetName), // nft_asset_name (bytes)
        priceLovelace, // price (int)
        creatorPkh, // creator_address (bytes)
        schoolPkh, // school_fund_address (bytes)
        platformPkh, // platform_address (bytes)
        beneficiaries.creatorPercent, // creator_percent (int)
        beneficiaries.schoolFundPercent, // school_fund_percent (int)
        beneficiaries.platformPercent, // platform_percent (int)
      ],
    };

    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    // The asset to lock
    const asset: Asset = {
      unit: nft.policyId + stringToHex(nft.assetName),
      quantity: "1",
    };

    // Build transaction
    // Lock asset at script address with datum
    const unsignedTx = await txBuilder
      .txOut(scriptAddress, [asset]) // Send to script address
      .txOutDatumHashValue(datum) // Attach datum
      .changeAddress(changeAddress)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Complete Escrow (Buy NFT)
   * Spends the UTxO from the script, paying the seller and beneficiaries.
   */
  static async completeEscrow(
    wallet: BrowserWallet,
    scriptUtxo: UTxO, // The UTxO to spend (found via fetcher)
    datum: any, // The parsed Datum from the UTxO
    beneficiaries: {
      creator: string;
      schoolFund: string;
      platform: string;
    }
  ) {
    const provider = this.getProvider();
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
      evaluator: provider,
    });

    const scriptCode = this.getContractCode();
    // Validate hex
    if (!/^[0-9a-fA-F]+$/.test(scriptCode))
      throw new Error("Invalid script code");

    const buyerAddress = await wallet.getChangeAddress();
    const buyerPkh = deserializeAddress(buyerAddress).pubKeyHash;

    // Construct Redeemer: Action::Buy { buyer_address }
    // Buy is first constructor (index 0)
    const redeemer = mConStr0([buyerPkh]);

    // Parse Datum values to know how much to pay whom
    const price = datum.fields[3].int as number;

    const creatorPercent = datum.fields[7].int as number;
    const schoolPercent = datum.fields[8].int as number;
    const platformPercent = datum.fields[9].int as number;

    // Calculate split amounts using PaymentService
    const { creatorAmount, schoolAmount, platformAmount } =
      PaymentService.calculateRevenueSplits(price, {
        creatorPercent,
        schoolFundPercent: schoolPercent,
        platformPercent,
      });

    const collaterals = await wallet.getCollateral();
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    // Spend logic
    const unsignedTx = await txBuilder
      .spendingPlutusScript("V2")
      .txIn(
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        scriptUtxo.output.amount,
        scriptUtxo.output.address
      )
      .txInScript(scriptCode)
      .txInDatumValue(datum)
      .txInRedeemerValue(redeemer)
      .txOut(beneficiaries.creator, [
        { unit: "lovelace", quantity: creatorAmount.toString() },
      ])
      .txOut(beneficiaries.schoolFund, [
        { unit: "lovelace", quantity: schoolAmount.toString() },
      ])
      .txOut(beneficiaries.platform, [
        { unit: "lovelace", quantity: platformAmount.toString() },
      ])
      .txInCollateral(
        collaterals[0].input.txHash,
        collaterals[0].input.outputIndex,
        collaterals[0].output.amount,
        collaterals[0].output.address
      )
      .changeAddress(changeAddress)
      .selectUtxosFrom(utxos)
      // signer
      .requiredSignerHash(buyerPkh)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }

  /**
   * Cancel Escrow
   * Returns the NFT to the seller.
   */
  static async cancelEscrow(
    wallet: BrowserWallet,
    scriptUtxo: UTxO,
    datum: any
  ) {
    const provider = this.getProvider();
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
      evaluator: provider,
    });

    const scriptCode = this.getContractCode();
    const ownerAddress = await wallet.getChangeAddress();
    const ownerPkh = deserializeAddress(ownerAddress).pubKeyHash;

    // Redeemer: Cancel (Action index 1)
    const redeemer = mConStr1([]);

    const collaterals = await wallet.getCollateral();
    const utxos = await wallet.getUtxos();

    const unsignedTx = await txBuilder
      .spendingPlutusScript("V2")
      .txIn(
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        scriptUtxo.output.amount,
        scriptUtxo.output.address
      )
      .txInScript(scriptCode)
      .txInDatumValue(datum)
      .txInRedeemerValue(redeemer)
      .txInCollateral(
        collaterals[0].input.txHash,
        collaterals[0].input.outputIndex,
        collaterals[0].output.amount,
        collaterals[0].output.address
      )
      .requiredSignerHash(ownerPkh)
      .changeAddress(ownerAddress)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  }
}
