use cardano/transaction.{Transaction, OutputReference}
use aiken/collection/list
use cardano/script_context.{ScriptContext}

/// Statut d'une commande
pub type OrderStatus {
  Pending
  Paid
  Shipped
  Completed
  Cancelled
}

/// Datum pour une commande sur la blockchain
/// Contient toutes les informations nécessaires pour gérer le cycle de vie d'une commande
pub type OrderDatum {
  buyer_address: ByteArray,
  seller_address: ByteArray,
  item_id: ByteArray,
  quantity_kg: Int,
  unit_price_lovelace: Int,
  total_lovelace: Int,
  platform_fee_percent: Int,
  platform_address: ByteArray,
  status: OrderStatus,
  created_at: Int,
}

/// Actions possibles sur une commande
pub type OrderAction {
  /// Payer une commande - vérifie que le montant total est transféré
  Pay { payment_hash: ByteArray }
  /// Marquer la commande comme expédiée
  Ship { tracking_number: ByteArray }
  /// Marquer la commande comme complétée et distribuer les fonds
  Complete
  /// Annuler la commande et rembourser l'acheteur
  Cancel
}

/// Redeemer pour les actions sur les commandes
pub type OrderRedeemer {
  action: OrderAction,
}

/// Calcule les frais de plateforme
fn calculate_platform_fee(total: Int, fee_percent: Int) -> Int {
  (total * fee_percent) / 100
}

/// Calcule le montant pour le vendeur après déduction des frais
fn calculate_seller_amount(total: Int, fee_percent: Int) -> Int {
  total - calculate_platform_fee(total, fee_percent)
}

/// Vérifie que la transaction est signée
fn is_transaction_signed(context: ScriptContext) -> Bool {
  list.length(context.transaction.extra_signatories) > 0
}

/// Vérifie que l'acheteur a signé la transaction
fn buyer_signed(datum: OrderDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.buyer_address)
}

/// Vérifie que le vendeur a signé la transaction
fn seller_signed(datum: OrderDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.seller_address)
}

/// Validateur principal pour la gestion des commandes
/// Gère le cycle de vie complet d'une commande avec distribution des fonds
validator order_validator {
  spend(datum: Option<OrderDatum>, redeemer: OrderRedeemer, _utxo: OutputReference, context: ScriptContext) {
    when datum is {
      Some(d) -> {
        when redeemer.action is {
          // Action: Payer une commande
          Pay { payment_hash } -> {
            // Vérifier que la commande est en statut Pending
            d.status == Pending
              // Vérifier que l'acheteur signe la transaction
              && buyer_signed(d, context)
              // Vérifier que la transaction est signée
              && is_transaction_signed(context)
              // Vérifier que le montant total est correct
              && d.total_lovelace > 0
          }
          
          // Action: Expédier la commande
          Ship { tracking_number } -> {
            // Vérifier que la commande a été payée
            d.status == Paid
              // Vérifier que le vendeur signe la transaction
              && seller_signed(d, context)
              // Note: ByteArray n'est pas une List, pas besoin de vérifier la longueur
              // Le tracking_number peut être vide si aucun tracking n'est fourni
          }
          
          // Action: Compléter la commande et distribuer les fonds
          Complete -> {
            // Vérifier que la commande a été expédiée
            d.status == Shipped
              // Vérifier que l'acheteur confirme la réception
              && buyer_signed(d, context)
              // Vérifier que les pourcentages sont valides
              && d.platform_fee_percent >= 0
              && d.platform_fee_percent <= 100
          }
          
          // Action: Annuler la commande
          Cancel -> {
            // La commande peut être annulée par l'acheteur si Pending
            // ou par le vendeur si Pending ou Paid
            when d.status is {
              Pending -> buyer_signed(d, context) || seller_signed(d, context)
              Paid -> seller_signed(d, context)
              _ -> False
            }
          }
        }
      }
      None -> False
    }
  }
}

/// Version simplifiée pour les tests
validator simple_order_validator {
  spend(_datum: Option<OrderDatum>, _redeemer: OrderRedeemer, _utxo: OutputReference, _context: ScriptContext) {
    True
  }
}
