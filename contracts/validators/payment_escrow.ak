use cardano/transaction.{Transaction, OutputReference}
use aiken/collection/list
use cardano/script_context.{ScriptContext}

/// Statut d'un paiement en escrow
pub type EscrowStatus {
  Locked
  Released
  Refunded
  Disputed
}

/// Décision pour résoudre un litige
pub type DisputeDecision {
  ReleaseToBeneficiary
  RefundToPayer
  Split { beneficiary_percent: Int }
}

/// Datum pour un paiement en escrow (séquestre)
/// Permet de verrouiller des fonds jusqu'à la résolution d'une transaction
pub type EscrowDatum {
  payer_address: ByteArray,
  beneficiary_address: ByteArray,
  amount_lovelace: Int,
  arbiter_address: ByteArray,
  deadline_timestamp: Int,
  description: ByteArray,
  status: EscrowStatus,
}

/// Actions possibles sur un escrow
pub type EscrowAction {
  /// Libérer les fonds au bénéficiaire
  Release
  /// Rembourser le payeur
  Refund
  /// Créer un litige
  Dispute { reason: ByteArray }
  /// Résoudre un litige (par l'arbitre)
  ResolveDispute { decision: DisputeDecision }
}

/// Redeemer pour les actions sur l'escrow
pub type EscrowRedeemer {
  action: EscrowAction,
}

/// Vérifie que la transaction est signée
fn is_transaction_signed(context: ScriptContext) -> Bool {
  list.length(context.transaction.extra_signatories) > 0
}

/// Vérifie que le payeur a signé la transaction
fn payer_signed(datum: EscrowDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.payer_address)
}

/// Vérifie que le bénéficiaire a signé la transaction
fn beneficiary_signed(datum: EscrowDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.beneficiary_address)
}

/// Vérifie que l'arbitre a signé la transaction
fn arbiter_signed(datum: EscrowDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.arbiter_address)
}

/// Calcule le montant pour le bénéficiaire lors d'un split
fn calculate_beneficiary_split(total: Int, percent: Int) -> Int {
  (total * percent) / 100
}

/// Calcule le montant pour le payeur lors d'un split
fn calculate_payer_split(total: Int, percent: Int) -> Int {
  total - calculate_beneficiary_split(total, percent)
}

/// Validateur principal pour les paiements en escrow
/// Gère le verrouillage et la distribution sécurisée des fonds
validator payment_escrow {
  spend(datum: Option<EscrowDatum>, redeemer: EscrowRedeemer, _utxo: OutputReference, context: ScriptContext) {
    when datum is {
      Some(d) -> {
        when redeemer.action is {
          // Action: Libérer les fonds au bénéficiaire
          Release -> {
            // Vérifier que l'escrow est verrouillé
            d.status == Locked
              // Le bénéficiaire ou l'arbitre peut libérer les fonds
              && (beneficiary_signed(d, context) || arbiter_signed(d, context))
              // Vérifier que le montant est valide
              && d.amount_lovelace > 0
          }
          
          // Action: Rembourser le payeur
          Refund -> {
            // Vérifier que l'escrow est verrouillé
            d.status == Locked
              // Le payeur ou l'arbitre peut demander un remboursement
              && (payer_signed(d, context) || arbiter_signed(d, context))
              // Vérifier que le montant est valide
              && d.amount_lovelace > 0
          }
          
          // Action: Créer un litige
          Dispute { reason } -> {
            // Vérifier que l'escrow est verrouillé
            d.status == Locked
              // Le payeur ou le bénéficiaire peut créer un litige
              && (payer_signed(d, context) || beneficiary_signed(d, context))
              // Note: reason est un ByteArray, pas besoin de vérifier la longueur
          }
          
          // Action: Résoudre un litige
          ResolveDispute { decision } -> {
            // Vérifier que l'escrow est en litige
            d.status == Disputed
              // Seul l'arbitre peut résoudre
              && arbiter_signed(d, context)
              // Vérifier que la décision est valide
              && when decision is {
                ReleaseToBeneficiary -> True
                RefundToPayer -> True
                Split { beneficiary_percent } -> {
                  // Vérifier que le pourcentage est valide (0-100%)
                  beneficiary_percent >= 0 && beneficiary_percent <= 100
                }
              }
          }
        }
      }
      None -> False
    }
  }
}

/// Version simplifiée pour les tests
validator simple_payment_escrow {
  spend(_datum: Option<EscrowDatum>, _redeemer: EscrowRedeemer, _utxo: OutputReference, _context: ScriptContext) {
    True
  }
}
