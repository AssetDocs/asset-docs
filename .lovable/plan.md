
## Full Scope Analysis

### Floor Plan References to Remove

**UI Components/Pages (delete or edit):**
1. `src/components/PropertyFloorPlans.tsx` — delete entire file
2. `src/components/PropertyTabs.tsx` — remove 4th tab (Floor Plans), change grid from `grid-cols-4` to `grid-cols-3`, remove import of `PropertyFloorPlans`
3. `src/components/FeaturesList.tsx` — remove "Floor plan integration" list item
4. `src/components/DocumentationChecklist.tsx` — remove 3 "Floor plans" checklist items (business, multi, industrial)
5. `src/components/admin/SystemArchitectureFlowcharts.tsx` — remove `'floor-plans'` from the 6-bucket array, update label from "6 Private Storage Buckets" to "5 Private Storage Buckets", change `grid-cols-6` to `grid-cols-5`
6. `src/pages/PressNews.tsx` — remove "floorplans" mention from bullet
7. `src/pages/CompassPartnership.tsx` — 3 mentions of "floorplans" in text/UI cards
8. `src/pages/HabitatPartnership.tsx` — 1 mention "Store floorplans..."
9. `src/pages/BlogPost.tsx` — 3 casual "floorplans" text mentions within blog prose

**Services:**
10. `src/services/SearchService.ts` — remove the entire `floorplans` entry (id, title, description, path, keywords), remove `'floor plans'` from contextual keywords array
11. `src/services/ExportService.ts` — remove `floorPlans` from `AssetSummary` interface, remove from `getUserAssets` initializer, remove the `case 'floor-plans'` branch, remove the Floor Plans PDF section, remove `floorPlans.length` from totalFiles count, remove `floorPlansFolder` and the download-floor-plans loop in ZIP export

**Hooks:**
12. `src/hooks/usePropertyFiles.ts` — remove `'floor-plan'` from the `fileType` union type parameter, remove `'floor-plan': 'floor-plans'` from `bucketMap`

**Components (counts/totals):**
13. `src/components/DashboardGrid.tsx` — remove `assets.floorPlans.length` from `totalFiles` count
14. `src/components/DownloadAllFilesButton.tsx` — remove `assets.floorPlans.length` from `totalFiles`
15. `src/components/PropertyList.tsx` — remove `floorPlans` array from `Property` interface

**Edge Functions:**
16. `supabase/functions/send-gift-email/index.ts` — remove "Floor plan scanning" feature line from both standard and premium gift email templates
17. `BACKUP_floor_plan_components/cubicasa-floor-plan-edge-function.ts.backup` — delete backup file

**Database/Storage:**
18. New migration: Drop `floor-plans` storage bucket RLS policies and delete the bucket
19. New migration: Remove `'floor-plan'` from the `property_files.file_type` CHECK constraint (if one exists — the migration `20251108...` shows `CHECK (file_type IN ('photo', 'video', 'document', 'floor-plan'))`)

---

### Account Creation Flow Review (starting from Stripe payment)

The flow is:
```
/pricing → create-checkout (Stripe) → Stripe Checkout → /subscription-success?session_id=...
  → finalize-checkout (edge fn) → sends magic link email
  → /auth/callback#access_token=... → checks profile → /welcome/create-password
  → 4-step wizard (password, name, phone, property) → /account
```

**What looks correct:**
- `SubscriptionSuccess.tsx` calls `finalize-checkout` with session_id, handles error/success states cleanly
- `AuthCallback.tsx` handles both hash fragment (magic link) and token_hash (OTP) flows, correctly routes to `/welcome/create-password` if `!password_set`
- `CreatePassword.tsx` is a clean 4-step wizard that writes all data in one final DB call

**Potential issues to flag/review during testing:**
1. `finalize-checkout` sends a magic link — the email template should be verified (subject line, link works, redirects to `/auth/callback`)
2. The `AuthCallback` hash flow has a 10-second timeout — if Supabase takes longer to parse the hash, the user sees "Session could not be established"
3. `CreatePassword.tsx` step 2 (Phone) has a button `onClick={() => setStep(3)}` that skips calling `advanceStep` — this is intentional since phone is optional, but worth noting
4. After `handleFinish`, it navigates directly to `/account` without waiting for `onAuthStateChange` to re-fire — this relies on the `USER_UPDATED` event in `AuthContext` refreshing the profile. With the recent AuthContext refactor (profile fetch in separate `useEffect([user.id])`), this should work correctly
5. `ProtectedRoute` will see `profile.onboarding_complete = true` (set in handleFinish) and allow entry — correct

---

## Files to Change

### Deletions
- `src/components/PropertyFloorPlans.tsx` — full delete
- `BACKUP_floor_plan_components/cubicasa-floor-plan-edge-function.ts.backup` — full delete

### Edits (14 files)
| File | Change |
|---|---|
| `src/components/PropertyTabs.tsx` | Remove Floor Plans tab, 3-col grid, remove import |
| `src/hooks/usePropertyFiles.ts` | Remove `'floor-plan'` type + bucket mapping |
| `src/services/SearchService.ts` | Remove floorplans entry + keyword |
| `src/services/ExportService.ts` | Remove `floorPlans` from interface, initializer, PDF section, ZIP section, totals |
| `src/components/DashboardGrid.tsx` | Remove `floorPlans.length` from totalFiles |
| `src/components/DownloadAllFilesButton.tsx` | Remove `floorPlans.length` from totalFiles |
| `src/components/PropertyList.tsx` | Remove `floorPlans` from Property interface |
| `src/components/FeaturesList.tsx` | Remove "Floor plan integration" bullet |
| `src/components/DocumentationChecklist.tsx` | Remove 3 Floor Plans checklist items |
| `src/components/admin/SystemArchitectureFlowcharts.tsx` | Remove floor-plans bucket, update count/grid |
| `src/pages/PressNews.tsx` | Remove "floorplans" text |
| `src/pages/CompassPartnership.tsx` | Remove 3 floorplans references |
| `src/pages/HabitatPartnership.tsx` | Remove 1 floorplans reference |
| `src/pages/BlogPost.tsx` | Remove/rephrase 3 floorplans text mentions |
| `supabase/functions/send-gift-email/index.ts` | Remove "Floor plan scanning" from both plan email templates |

### Database Migration
- Drop all RLS policies on `storage.objects` for bucket `floor-plans`
- Delete the `floor-plans` storage bucket
- Remove `'floor-plan'` from `property_files.file_type` CHECK constraint (replace with new constraint without it)

### App.tsx
- Remove the `/account/floorplans` route if it exists (search showed it doesn't exist as a route, only in SearchService — already covered above)

---

## Implementation Order
1. DB migration (remove bucket + fix CHECK constraint)
2. Delete `PropertyFloorPlans.tsx` and backup file
3. Edit all 14 source files in parallel
