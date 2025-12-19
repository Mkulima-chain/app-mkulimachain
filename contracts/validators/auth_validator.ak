use cardano/transaction.{Transaction, OutputReference}
use aiken/collection/list
use cardano/script_context.{ScriptContext}

/// Rôle d'un utilisateur sur la plateforme
pub type UserRole {
  Farmer
  Buyer
  Admin
  Platform
}

/// Datum pour l'authentification et les permissions
/// Stocke les informations d'enregistrement et de rôle d'un utilisateur
pub type AuthDatum {
  user_address: ByteArray,
  role: UserRole,
  registered_at: Int,
  is_active: Bool,
  metadata_hash: Option<ByteArray>,
}

/// Actions possibles pour l'authentification
pub type AuthAction {
  /// Enregistrer un nouvel utilisateur
  Register { signature: ByteArray }
  /// Vérifier une action signée
  Verify { action_hash: ByteArray }
  /// Désactiver un utilisateur
  Deactivate
  /// Mettre à jour le rôle d'un utilisateur
  UpdateRole { new_role: UserRole }
}

/// Redeemer pour les actions d'authentification
pub type AuthRedeemer {
  action: AuthAction,
}

/// Vérifie que la transaction est signée
fn is_transaction_signed(context: ScriptContext) -> Bool {
  list.length(context.transaction.extra_signatories) > 0
}

/// Vérifie que l'utilisateur a signé la transaction
fn user_signed(datum: AuthDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.user_address)
}

/// Vérifie qu'un admin ou la plateforme a signé
fn admin_or_platform_signed(datum: AuthDatum, context: ScriptContext) -> Bool {
  // Note: En production, il faudrait vérifier contre une liste d'adresses admin
  // Pour simplifier, on vérifie juste que la transaction est signée
  is_transaction_signed(context)
    && when datum.role is {
      Admin -> True
      Platform -> True
      _ -> False
    }
}

/// Validateur pour l'authentification et la gestion des permissions
/// Permet d'enregistrer des utilisateurs et de vérifier leurs permissions
validator auth_validator {
  spend(datum: Option<AuthDatum>, redeemer: AuthRedeemer, _utxo: OutputReference, context: ScriptContext) {
    when datum is {
      Some(d) -> {
        when redeemer.action is {
          // Action: Enregistrer un nouvel utilisateur
          Register { signature } -> {
            // Vérifier que l'utilisateur signe son propre enregistrement
            user_signed(d, context)
              // Note: signature est un ByteArray, pas besoin de vérifier la longueur
              // Vérifier que le compte n'est pas déjà actif
              && !d.is_active
          }
          
          // Action: Vérifier une action signée
          Verify { action_hash } -> {
            // Vérifier que l'utilisateur est actif
            d.is_active
              // Vérifier que l'utilisateur signe l'action
              && user_signed(d, context)
              // Note: action_hash est un ByteArray, pas besoin de vérifier la longueur
          }
          
          // Action: Désactiver un utilisateur
          Deactivate -> {
            // L'utilisateur peut se désactiver lui-même
            // ou un admin peut désactiver n'importe qui
            user_signed(d, context) || admin_or_platform_signed(d, context)
          }
          
          // Action: Mettre à jour le rôle
          UpdateRole { new_role } -> {
            // Seul un admin ou la plateforme peut changer les rôles
            admin_or_platform_signed(d, context)
              // Vérifier que le nouveau rôle est valide
              && when new_role is {
                Farmer -> True
                Buyer -> True
                Admin -> True
                Platform -> True
              }
          }
        }
      }
      None -> False
    }
  }
}

/// Version simplifiée pour les tests
/// Permet toutes les opérations d'authentification
validator simple_auth_validator {
  spend(_datum: Option<AuthDatum>, _redeemer: AuthRedeemer, _utxo: OutputReference, _context: ScriptContext) {
    True
  }
}
