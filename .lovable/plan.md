
## Assessment: Should you remove the multi-step wizard and redirect straight to the dashboard?

**Short answer: Yes — this is a great simplification and it's very achievable.**

### Current flow (4 steps, friction-heavy)
```text
Magic link → /auth/callback → /welcome/create-password
  Step 0: Set password
  Step 1: Name (required)
  Step 2: Phone (optional)
  Step 3: Property address (optional)
  → "Go to Dashboard" → /account
```
The multi-step wizard is the source of the redirect loop bug we just fixed, and it delays the user from reaching their dashboard by 3–4 screens.

### Proposed flow (1 step, seamless)
```text
Magic link → /auth/callback → /welcome/create-password
  Step 0: Set password only
  → "Go to Dashboard" → /account  (with welcome prompt/banner)
```
The dashboard already has `OnboardingProgress` — a phased checklist that prompts "Complete Your Profile", "Create Your First Property", "Upload Photos" etc. This already handles progressive onboarding perfectly.

### What changes

**`src/pages/CreatePassword.tsx`**
- Remove steps 1–3 (Name, Phone, Property) and the stepper UI entirely
- The page becomes a single focused screen: just password + confirm password + "Go to Dashboard" button
- `handleFinish` sets `password_set: true` and `onboarding_complete: true`, then calls `refreshProfile()` and navigates — identical logic, just no other fields collected

**`src/components/AccountSettings.tsx` or `ProfileTab.tsx`**
- Name, phone, and first property are already editable from Account Settings — no new work needed there

**`src/components/OnboardingProgress.tsx`** (optional enhancement)
- The "Getting Started" phase already prompts users to complete their profile and add a property
- Could optionally add a "Complete your profile" banner nudge in `WelcomeBanner.tsx` for new users who haven't filled in their name yet

### Why this works cleanly
- `onboarding_complete` gets set to `true` immediately after password creation — no stale-state race condition
- The dashboard's existing `OnboardingProgress` component already handles progressive disclosure of the next steps
- No changes needed to `ProtectedRoute` or `App.tsx` routing logic
- The flow becomes identical to the contributor onboarding experience (which is already streamlined)

### Files to change

| File | Change |
|---|---|
| `src/pages/CreatePassword.tsx` | Remove steps 1–3, keep only the password step. Update `handleFinish` to write `password_set: true` + `onboarding_complete: true` and navigate immediately |

That's the only required change — 1 file, significantly simpler. The dashboard already has all the progressive onboarding prompts in place to guide users from there.
