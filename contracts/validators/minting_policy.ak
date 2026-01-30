use cardano/transaction.{Transaction}
use cardano/assets.{PolicyId}
use aiken/collection/list
use cardano/script_context.{ScriptContext}

/// Validateur principal du minting policy
/// Vérifie que la transaction est signée
validator minting_policy {
  mint(_redeemer: Data, _policy_id: PolicyId, context: ScriptContext) {
    list.length(context.transaction.extra_signatories) > 0
  }
}

/// Version simplifiée pour les tests
validator simple_minting_policy {
  mint(_redeemer: Data, _policy_id: PolicyId, _context: ScriptContext) {
    True
  }
}
