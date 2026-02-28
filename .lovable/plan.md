
## Fix: "Upload Your First Photos or Videos" Milestone in Security Progress

### Root Cause

There are **two different upload thresholds** in the codebase that are conflated in `SecurityProgress.tsx`:

- `upload_count_met` (SQL field) — requires **≥ 10 files** total across `items` + `property_files`. This is the "power user" verification scoring gate.
- `upload_count` (SQL field) — the raw count. A user with even 1 photo has `upload_count >= 1`.

`SecurityProgress.tsx` line 38 uses `criteria?.upload_count_met` for the label **"Upload Your First Photos or Videos"** — but `upload_count_met` is the 10-file gate, not a "first upload" check. So a user with 5 photos (a perfectly active user) still sees this unchecked.

`OnboardingProgress.tsx` already solves this correctly on line 103 — it reads `upload_count > 0` directly, not `upload_count_met`.

---

### Scope

**One file, one line change.**

**File: `src/components/SecurityProgress.tsx` — line 38**

Change the completed condition for the upload milestone from:

```ts
{ label: 'Upload Your First Photos or Videos', completed: criteria?.upload_count_met ?? false, phase: 1 },
```

To:

```ts
{ label: 'Upload Your First Photos or Videos', completed: (criteria?.upload_count ?? 0) >= 1, phase: 1 },
```

This aligns the label intent ("first upload") with the actual check (at least 1 file exists), matching how `OnboardingProgress.tsx` already handles it.

---

### Why This Is the Right Fix

The 9-milestone scoring system (which uses `upload_count_met` as the ≥10 gate) is **separate** from the dashboard progress display. The verification score itself doesn't change — `milestone_count` and `is_verified` are computed by the edge function. The Security Progress panel is a **display-only motivator** meant to guide users through onboarding steps. "Upload your first photo" is a getting-started action, not a "have 10 files" advanced milestone.

If we want to preserve the 10-file gate in the milestone score for verification purposes while showing a "first upload" check in the panel, we just need `SecurityProgress` to use the raw count.

---

### What Is NOT Changing

- The SQL `compute_user_verification` function — no migration needed
- The `upload_count_met` field definition — still means ≥ 10, still used in `AccountStatusCard` and `VerificationProgress` where the "10/10" framing is intentional
- The edge function `check-verification` — untouched
- `OnboardingProgress.tsx` — already correct, no change needed
- All other milestone items in `SecurityProgress.tsx` — untouched
- The verification score itself — a user's `is_verified` / `is_verified_plus` status is unaffected

---

### Secondary Note (No Code Change Required)

The `VerificationProgress.tsx` component (used on the Account page) intentionally shows `0/10 files uploaded` with `upload_count_met` as the gate — that framing is deliberate for the formal verification progress card. No change needed there; the two components serve different purposes.
