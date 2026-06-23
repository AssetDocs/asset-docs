# Asset Safe — Retention / Deletion Policy Matrix

**Purpose:** Authoritative per-table policy for what happens to rows when a user deletes their Asset Safe account. This document is the source of truth for `delete-account` and any sweeper that runs after the deletion grace window closes.

**Legend**
- **purge** — hard `DELETE` during account deletion. Row is gone.
- **retain** — keep row as-is. Required for legal, tax, fraud, or security reasons.
- **anonymize** — keep row for aggregate/legal value, but strip or replace direct PII (`user_id`, `email`, `name`, `ip`, free-text). Replace `user_id` with a reference to `deleted_accounts.id` (a tombstone), and replace `email` with a SHA-256 hash so duplicate-signup detection still works without storing the plaintext.

**Tombstone reference pattern (recommended):**
Add `deleted_account_id uuid references deleted_accounts(id)` to any table marked `anonymize`. On deletion: insert a `deleted_accounts` row, then `UPDATE … SET user_id = NULL, email = NULL, email_hash = encode(digest(lower(email),'sha256'),'hex'), deleted_account_id = <new tombstone id>`.

---

## Recommended Matrix

| # | Table | Recommended Policy | Retention Window | Identifier Handling | Rationale |
|---|---|---|---|---|---|
| 1 | `payment_events` | **anonymize** | 7 years (US tax / IRS) | Strip `user_id`/`email`; keep `stripe_customer_id`, `amount`, `currency`, `event_type`, timestamps. Link to `deleted_account_id`. | Required for tax + chargeback defense. Stripe is system of record but we need a local audit trail. |
| 2 | `stripe_events` | **retain** | 2 years, then purge | No PII at row level (Stripe event payload only). Keep raw. | Idempotency table for webhook replay protection. Safe to keep — Stripe IDs only. |
| 3 | `subscribers` | **anonymize** | 7 years | Null `email`, `user_id`; keep `stripe_customer_id`, plan, status, dates. Link to `deleted_account_id`. | Tax + revenue reporting. Needed to reconcile against Stripe. |
| 4 | `entitlements` | **purge** | Delete with account | N/A | Current-state table only — no historical value once subscription is closed. Stripe + `payment_events` already have the history. |
| 5 | `audit_logs` | **retain** | 7 years | Keep `actor_user_id` as-is. | Security/forensics. Must survive account deletion to investigate retroactive abuse. Document in Privacy Policy. |
| 6 | `user_activity_logs` | **anonymize** | 2 years, then purge | Null `user_id`; keep event_type, timestamp, coarse metadata. Drop `ip`, `user_agent`. | Product analytics only — no legal requirement, but aggregate retention is useful. |
| 7 | `legal_agreement_signatures` | **retain** | 10 years (statute of limitations) | Keep `user_id`, `email`, `ip`, `signed_at`, `terms_version_id` untouched. | **Critical** — proof of consent to ToS/Privacy at the time of signing. Cannot anonymize or we lose enforceability. Document in Privacy Policy as a lawful basis (legitimate interest / legal obligation). |
| 8 | `user_consents` | **retain** | 10 years | Same as #7. | Same reasoning — proof of GDPR/CCPA/marketing consent. |
| 9 | `checkout_fulfillments` | **anonymize** | 7 years | Null `user_id`/`email`; keep `stripe_session_id`, plan, amount, status. Link to `deleted_account_id`. | Reconciliation + dispute defense. |
| 10 | `checkout_session_audit` | **anonymize** | 2 years, then purge | Null `user_id`; keep session id, outcome, timestamp. | Fraud/abuse forensics, lower legal weight. |
| 11 | `subscription_cancellations` | **anonymize** | 7 years | Null `user_id`/`email`; keep reason, plan, cancelled_at. Link to `deleted_account_id`. | Cohort/churn analysis + dispute defense. |
| 12 | `account_closure_requests` | **anonymize** | 3 years | Null `owner_user_id`; keep status, requested_at, scheduled_for, reversed_at. Link to `deleted_account_id`. | Proof the user requested closure (defense against "you deleted my account without consent"). |
| 13 | `account_deletion_requests` | **anonymize** | 3 years | Same as #12. | Proof of GDPR/CCPA erasure request fulfillment. |
| 14 | `gift_subscriptions` | **anonymize (split)** | 7 years | If the **deleted user is the purchaser**: null `purchaser_user_id`/`purchaser_email`, keep recipient fields. If the **deleted user is the recipient**: null `recipient_user_id`/`recipient_email`, keep purchaser fields. Never purge — the other party still has a financial relationship to the gift. | Two parties per row; deletion of one must not destroy the other's record. |
| 15 | `deleted_accounts` | **retain (this IS the tombstone)** | Indefinite (≥ 7 years) | Stores `original_user_id`, `email_hash`, `deleted_at`, `reason`. Never contains plaintext email after creation. | Anchor for all anonymized FKs. Prevents re-signup abuse and supports law-enforcement requests. |

---

## Cross-cutting decisions you need to confirm

1. **Email hashing** — OK to store `sha256(lower(email))` in `deleted_accounts.email_hash` for duplicate-signup / fraud detection? (Recommended: **yes**.)
2. **`legal_agreement_signatures` keeping plaintext email after deletion** — this is the strongest recommendation in the matrix but also the most sensitive. Confirm you want plaintext retained (vs hashed). Most legal counsel says **plaintext** because a hash isn't admissible as proof of identity in a contract dispute.
3. **`audit_logs` keeping `user_id`** — same question. Recommended **yes** for security forensics, but you could anonymize after 2 years and retain only for the most recent window.
4. **Default purge window for `account_closure_requests`/`account_deletion_requests`** — 3 years is a conservative middle ground. Raise to 7 if your counsel wants symmetry with tax records.
5. **Privacy Policy disclosure** — every `retain` and `anonymize` row above must be disclosed in the Privacy Policy retention section. Confirm we should update that doc in the same sprint.

---

## What to send back to the developer

Once you mark any cells you want to change, the dev has everything needed to:

- Add `deleted_account_id` FK column to tables marked `anonymize`.
- Write the deletion routine in `delete-account` as a single transaction: (a) insert tombstone, (b) `UPDATE … SET user_id = NULL, email = NULL, deleted_account_id = …` on all `anonymize` tables, (c) `DELETE` on all `purge` tables, (d) leave `retain` tables untouched.
- Add a nightly sweeper to enforce the time-based purge windows (e.g. drop `user_activity_logs` rows older than 2 years).
- Update the Privacy Policy retention table to match.
- Use `docs/AssetSafe_Audit_Log_Retention_Runbook.md` for audit-log access, export, and tamper-evidence operations.

---

*Generated for product/legal review. Edit the "Recommended Policy" column to lock in final decisions before development begins.*
