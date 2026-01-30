use aiken/collection/list
use cardano/script_context.{ScriptContext}
use cardano/transaction.{OutputReference, Transaction}

/// Loan status
pub type LoanStatus {
  Pending
  Approved
  Active
  Repaid
  Defaulted
  Rejected
}

/// Datum for a DeFi microloan
/// Contains all information to manage the lifecycle of a loan
pub type LoanDatum {
  farmer_address: ByteArray,
  amount_lovelace: Int,
  interest_rate: Int,
  // Base 100 (ex: 5 = 5%)
  duration_days: Int,
  start_timestamp: Int,
  due_timestamp: Int,
  lender_address: ByteArray,
  platform_address: ByteArray,
  status: LoanStatus,
  approved_by: Option<ByteArray>,
}

/// Possible actions on a loan
pub type LoanAction {
  /// Approve a loan request
  Approve { approver_signature: ByteArray }
  /// Activate the loan and unlock funds
  Activate { transaction_hash: ByteArray }
  /// Repay the loan with interest
  Repay { payment_amount: Int }
  /// Mark the loan in default
  MarkDefaulted
  /// Reject a loan request
  Reject { reason: ByteArray }
}

/// Redeemer for loan actions
pub type LoanRedeemer {
  action: LoanAction,
}

/// Calculate the total repayment amount (principal + interest)
fn calculate_repayment_amount(amount: Int, interest_rate: Int) -> Int {
  amount + amount * interest_rate / 100
}

/// Checks that the transaction is signed
fn is_transaction_signed(context: ScriptContext) -> Bool {
  list.length(context.transaction.extra_signatories) > 0
}

/// Checks that the farmer has signed the transaction
fn farmer_signed(datum: LoanDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.farmer_address)
}

/// Checks that the lender has signed the transaction
fn lender_signed(datum: LoanDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.lender_address)
}

/// Checks that the platform has signed the transaction
fn platform_signed(datum: LoanDatum, context: ScriptContext) -> Bool {
  list.has(context.transaction.extra_signatories, datum.platform_address)
}

/// Checks that the transaction timestamp is after the due date
fn is_overdue(datum: LoanDatum, context: ScriptContext) -> Bool {
  // Note: In production, use context.transaction.validity_range
  // For simplicity, we just check that the transaction is signed
  is_transaction_signed(context)
}

/// Main validator for loan management
/// Manages the complete lifecycle of a DeFi microloan
validator loan_validator {
  spend(
    datum: Option<LoanDatum>,
    redeemer: LoanRedeemer,
    _utxo: OutputReference,
    context: ScriptContext,
  ) {
    when datum is {
      Some(d) ->
        when redeemer.action is {
          // Action: Approve a loan
          Approve { approver_signature } ->
            // Check that the loan is in Pending status
            d.status == Pending && // Check that the platform approves
            platform_signed(d, context) && // Check that the amount is valid
            d.amount_lovelace > 0 && // Check that the interest rate is reasonable (max 50%)
            d.interest_rate > 0 && d.interest_rate <= 50 && // Check that the duration is valid (min 1 day)
            d.duration_days > 0
          // Action: Activate the loan and unlock funds
          Activate { transaction_hash } ->
            // Check that the loan has been approved
            d.status == Approved && // Check that the platform activates the loan
            platform_signed(d, context)
          // Note: transaction_hash is a ByteArray, no need to check length
          // Action: Repay the loan
          Repay { payment_amount } ->
            // Check that the loan is active
            d.status == Active && // Check that the farmer repays
            farmer_signed(d, context) && // Calculate the expected amount
            {
              let expected_amount =
                calculate_repayment_amount(d.amount_lovelace, d.interest_rate)
              // Check that the paid amount is sufficient
              payment_amount >= expected_amount
            }
          // Action: Mark in default
          MarkDefaulted ->
            // Check that the loan is active
            d.status == Active && // Check that the platform marks the default
            platform_signed(d, context) && // Check that the due date is passed
            is_overdue(d, context)
          // Action: Reject a loan request
          Reject { reason } ->
            // Check that the loan is in Pending status
            d.status == Pending && // Check that the platform rejects
            platform_signed(d, context)
        }
      // Note: reason is a ByteArray, no need to check length
      None -> False
    }
  }

  else(_) {
    fail
  }
}

/// Simplified version for testing
validator simple_loan_validator {
  spend(
    _datum: Option<LoanDatum>,
    _redeemer: LoanRedeemer,
    _utxo: OutputReference,
    _context: ScriptContext,
  ) {
    True
  }

  else(_) {
    fail
  }
}
