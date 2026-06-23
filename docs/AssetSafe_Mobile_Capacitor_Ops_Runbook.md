# Asset Safe Mobile / Capacitor Operations Runbook

Status: launch operations runbook
Owner: Asset Safe operator / Mobile release owner
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`
- `docs/AssetSafe_Growth_Product_Ops_Runbook.md`
- `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`

## Purpose

This runbook defines the operating model for Asset Safe's Capacitor/mobile surface: release ownership, app-store readiness, update strategy, mobile session handling, privacy labels, QA, and rollback.

The current repository includes `capacitor.config.ts` and Capacitor dependencies. No native platform source folders are currently present in the repo, and the Capacitor config points the shell at the hosted Lovable web app. Treat mobile as a packaging/release channel for the web app until native iOS/Android projects are added and reviewed.

## Current Posture

| Area | Current state | Launch implication |
|---|---|---|
| Capacitor config | Present | Mobile release process must be documented before store launch |
| Native `ios/` and `android/` folders | Not present in repo | No native store build should be considered reproducible from this repo yet |
| Web source of truth | Hosted web app | Web deploys remain the canonical production release path |
| Mobile shell URL | Points to Lovable-hosted URL | Confirm production domain and badge/query settings before app review |
| Native plugins | Splash screen only in config | No native storage, push, biometric, or deep-link assumptions until implemented |

## Release Channels

| Channel | Default owner | Release rule |
|---|---|---|
| Web app / PWA | Web release owner | Normal app deploy, smoke test, monitoring check |
| Capacitor internal build | Mobile release owner | Build from tagged commit, test on physical devices |
| TestFlight / Play internal testing | Mobile release owner | Requires QA matrix pass and privacy-label review |
| App Store / Play production | Business owner + mobile release owner | Requires launch gate sign-off |

Do not ship a production mobile app from an untracked local native project. Native project files, signing assumptions, app IDs, entitlements, and config changes must be committed or documented as operator-owned external state.

## Build And Release Checklist

Before any TestFlight, Play internal, or production store release:

1. Confirm the source commit, app version, and build number.
2. Confirm `capacitor.config.ts` points to the approved production URL.
3. Confirm the app ID, display name, icons, splash screen, and store metadata match the approved brand.
4. Confirm no test Lovable badge, staging URL, debug menu, console output, or test credentials are visible.
5. Confirm Supabase project references, Stripe mode, Resend mode, and legal links are production-safe.
6. Run the mobile QA matrix in this runbook on at least one current iOS and one current Android device.
7. Review App Store privacy nutrition labels and Google Play Data Safety answers.
8. Confirm support, legal, deletion/export, and subscription terms links work in the mobile shell.
9. Confirm rollback plan and owner.
10. Record release evidence: commit SHA, build number, tester, device matrix, approval date, and store submission IDs.

Recommended versioning:

| Artifact | Format |
|---|---|
| Git tag | `mobile-vYYYY.MM.DD-buildN` |
| iOS build | Increment every upload |
| Android versionCode | Increment every upload |
| Store release notes | User-facing, short, no internal implementation details |

## Update Strategy

Default policy:

- Web content deploys follow the normal web release process.
- Native shell changes require a store build and review.
- Do not use silent over-the-air native-code updates.
- Do not introduce a live-update provider until the operator approves targeting, rollback, kill-switch, and audit rules.

If a future live-update or OTA provider is added, document:

- Provider and account owner.
- Which app versions receive updates.
- Which code/data is eligible for OTA update.
- Approval process for shipping an update.
- Rollback mechanism.
- How a bad update is disabled for affected versions.
- How legal/privacy changes are gated before rollout.

Emergency rollback:

| Scenario | Default action |
|---|---|
| Bad web deploy affecting mobile shell | Roll back web deploy or enable maintenance mode |
| Bad native build in testing | Stop testing release, upload corrected build |
| Bad native build in production | Halt phased rollout if available, submit hotfix build, notify support |
| Security/privacy issue | Follow security incident response runbook |

## Mobile Session Handling

Mobile sessions must follow the same authorization model as the web app. A packaged mobile shell must not bypass MFA, account ownership, Authorized User boundaries, subscription status, deletion/closure states, or continuity controls.

Minimum session rules:

- Supabase Auth remains the source of authenticated identity.
- Session persistence must use platform-appropriate secure storage if native persistence is added.
- Logout must clear local session, cached downloads, temporary exports, and any user-specific local data.
- App resume must re-check session validity before sensitive actions.
- MFA step-up must still apply to protected workflows.
- Magic links and deep links must validate target account/workspace context after auth.
- Account closure, deletion, expired subscription, and read-only account states must render consistently with web.
- Authorized Users must see owner/context indicators and must not inherit owner-only controls.

Recommended high-risk workflows for mobile re-check:

| Workflow | Required guard |
|---|---|
| Account export/download | Fresh session and current entitlement |
| Account deletion/closure | Fresh session and step-up if enabled |
| Authorized User invitation/removal | Owner permission check |
| Continuity or recovery actions | Role and state-machine check |
| Billing/portal checkout | External browser or provider-approved flow |
| Email or MFA change | Fresh session, current auth provider controls |

## Mobile Security Controls

Minimum mobile security posture:

- Do not log access tokens, refresh tokens, magic links, recovery data, Stripe session URLs, or signed storage URLs.
- Do not persist generated exports beyond the user-initiated download/share flow.
- Clear temporary files on logout, account deletion, and failed export download.
- Redact PII from crash reports and analytics.
- Treat clipboard contents as sensitive; avoid copying secrets or signed URLs automatically.
- Avoid screenshots of sensitive content in app-store metadata.
- If biometric unlock is added, treat it as local convenience only. It must not replace account MFA or server-side authorization.
- If push notifications are added, do not include sensitive file, billing, recovery, or continuity details in notification bodies.

## Notifications

Transactional email remains the source of truth for legally significant and security-sensitive notices.

Do not rely solely on push notifications for:

- Terms or privacy updates.
- Billing failures or cancellation notices.
- Account deletion/closure confirmation.
- Export availability or expiration.
- Continuity trigger notices.
- Security incident or account recovery notices.

If push notifications are introduced later, document opt-in consent, token lifecycle, delivery monitoring, unsubscribe behavior, and how push tokens are removed during account deletion.

## Privacy And Store Compliance

Before store submission:

- Review App Store privacy nutrition labels.
- Review Google Play Data Safety answers.
- Confirm whether analytics, crash reporting, diagnostics, or tracking SDKs are present.
- Confirm whether mobile collects any data not already disclosed in the web Privacy Policy.
- Confirm Terms and Privacy links are accessible before signup/checkout where required.
- Confirm DSAR, export, account deletion, and support paths are available to mobile users.
- Confirm subscription, refund, and cancellation language matches the store distribution model.

Any material change to mobile data collection, tracking, subscriptions, notifications, or legal notices must follow `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`.

## QA Matrix

Run this matrix before TestFlight/Play internal release and before production store release.

| Area | Required checks |
|---|---|
| Install/upgrade | Fresh install, upgrade from prior build, uninstall/reinstall |
| Auth | Signup, login, logout, expired session, magic link/deep link if enabled |
| MFA | Enroll, verify, step-up, recovery path surfaces |
| Account context | Owner dashboard, Authorized User dashboard, shared account context |
| Billing | Checkout/portal launch, failed payment/read-only state, plan entitlement display |
| Files | Upload, preview/download, delete, export bundle request/download |
| Data lifecycle | Closure request, deletion request, export expiration behavior |
| Continuity | Continuity pages and permission boundaries render correctly |
| Network | Offline, poor network, app background/resume, retry/error states |
| Device | Current iOS, current Android, small phone viewport, tablet where supported |
| Accessibility | Dynamic text sanity check, tap targets, screen reader labels for primary flows |
| Legal/support | Terms, Privacy, support, DSAR/delete/export paths reachable |

Store launch is blocked if any owner-only workflow becomes accessible to an Authorized User, any deletion/export flow skips the current web authorization checks, or the app points at a non-production URL.

## Monitoring And Support

Minimum launch monitoring:

- Web/edge function monitoring remains authoritative for backend failures.
- Store release owner monitors TestFlight/Play crash and review feedback daily during first week.
- Support issue type should capture mobile platform, app version, OS version, device model, account role, and affected workflow.
- Any mobile-only auth, export, deletion, billing, or continuity report is escalated as high priority until reproduced or ruled out.

Recommended support triage fields:

- Platform: iOS, Android, mobile browser, desktop web.
- App version/build.
- OS version.
- Device model.
- Role: owner, Authorized User, recovery delegate, admin.
- Account/workspace being viewed.
- Whether the same action works on desktop web.

## Launch Gate

Production app-store launch requires sign-off on:

| Gate | Required evidence |
|---|---|
| Native source reproducibility | Native project files committed or external build process documented |
| Production URL and config | `capacitor.config.ts` reviewed |
| Privacy labels | App Store / Play evidence saved |
| Legal links | Terms, Privacy, subscription/refund language verified |
| QA matrix | Pass record with devices and build number |
| Session/security | MFA, AU, deletion, export, and billing guards verified |
| Rollback plan | Owner and rollback action recorded |
| Support readiness | Mobile triage fields and escalation path confirmed |

If these are not complete, Asset Safe can continue shipping the web/PWA experience while mobile app-store distribution remains deferred.

