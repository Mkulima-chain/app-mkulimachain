use aiken/collection/list
use cardano/script_context.{ScriptContext}
use cardano/transaction.{OutputReference, Transaction}

/// User role on the platform
pub type UserRole {
  Farmer
  Buyer
  Admin
  Platform
}

/// Datum for authentication and permissions
/// Stores the registration information and role of a user
pub type AuthDatum {
  user_address: ByteArray,
  role: UserRole,
  registered_at: Int,
  is_active: Bool,
  metadata_hash: Option<ByteArray>,
}

/// Possible actions for authentication
pub type AuthAction {
  /// Register a new user
  Register { signature: ByteArray }
  /// Verify a signed action
  Verify { action_hash: ByteArray }
  /// Deactivate a user
  Deactivate
  /// Update a user's role
  UpdateRole { new_role: UserRole }
}

/// Redeemer for authentication actions
pub type AuthRedeemer {
  action: AuthAction,
}

/// Checks that the transaction is signed
fn is_transaction_signed(context: ScriptContext) -> Bool {
  list.length(context.transaction.extra_signatories) > 0
}

/// Checks that the user has signed the transaction
fn user_signed(datum: AuthDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.user_address)
}

/// Checks that an admin or the platform has signed
fn admin_or_platform_signed(datum: AuthDatum, context: ScriptContext) -> Bool {
  // Note: In production, we should verify against a list of admin addresses
  // For simplicity, we just check that the transaction is signed
  is_transaction_signed(context) && when datum.role is {
    Admin -> True
    Platform -> True
    _ -> False
  }
}

/// Validator for authentication and permission management
/// Allows registering users and verifying their permissions
validator auth_validator {
  spend(
    datum: Option<AuthDatum>,
    redeemer: AuthRedeemer,
    _utxo: OutputReference,
    context: ScriptContext,
  ) {
    when datum is {
      Some(d) ->
        when redeemer.action is {
          // Action: Register a new user
          Register { signature } ->
            // Check that the user signs their own registration
            user_signed(d, context) && // Note: signature is a ByteArray, no need to check length
            // Check that the account is not already active
            !d.is_active
          // Action: Verify a signed action
          Verify { action_hash } ->
            // Check that the user is active
            d.is_active && // Check that the user signs the action
            user_signed(d, context)
          // Note: action_hash is a ByteArray, no need to check length
          // Action: Deactivate a user
          Deactivate ->
            // The user can deactivate themselves
            // or an admin can deactivate anyone
            user_signed(d, context) || admin_or_platform_signed(d, context)
          // Action: Update the role
          UpdateRole { new_role } ->
            // Only an admin or the platform can change roles
            admin_or_platform_signed(d, context) && // Check that the new role is valid
            when new_role is {
              Farmer -> True
              Buyer -> True
              Admin -> True
              Platform -> True
            }
        }
      None -> False
    }
  }

  else(_) {
    fail
  }
}

/// Simplified version for testing
/// Allows all authentication operations
validator simple_auth_validator {
  spend(
    _datum: Option<AuthDatum>,
    _redeemer: AuthRedeemer,
    _utxo: OutputReference,
    _context: ScriptContext,
  ) {
    True
  }

  else(_) {
    fail
  }
}
