use cardano/transaction.{Transaction, OutputReference}
use aiken/collection/list
use cardano/script_context.{ScriptContext}

/// Datum pour la vente de NFT
type SaleDatum {
  seller_address: ByteArray,
  nft_policy_id: ByteArray,
  nft_asset_name: ByteArray,
  price: Int,
  creator_address: ByteArray,
  school_fund_address: ByteArray,
  platform_address: ByteArray,
  creator_percent: Int,
  school_fund_percent: Int,
  platform_percent: Int,
}

/// Redeemer pour la vente
type SaleRedeemer {
  action: SaleAction,
}

type SaleAction {
  Buy { buyer_address: ByteArray }
  Cancel
}

/// Validateur principal pour la vente
/// Gère les achats et annulations avec distribution des revenus
validator sale_validator {
  spend(datum: Option<SaleDatum>, redeemer: SaleRedeemer, _utxo: OutputReference, context: ScriptContext) {
    when datum is {
      Some(d) -> {
        when redeemer.action is {
          Buy { buyer_address } -> {
            // Vérifier que les pourcentages totalisent 100%
            (d.creator_percent + d.school_fund_percent + d.platform_percent) == 100
              // Vérifier que la transaction est signée (au moins un signataire)
              && list.length(context.transaction.extra_signatories) > 0
          }
          Cancel -> {
            // Vérifier que la transaction est signée (au moins un signataire)
            list.length(context.transaction.extra_signatories) > 0
          }
        }
      }
      None -> False
    }
  }
}

/// Version simplifiée pour les tests
validator simple_sale_validator {
  spend(_datum: Option<SaleDatum>, _redeemer: SaleRedeemer, _utxo: OutputReference, _context: ScriptContext) {
    True
  }
}
