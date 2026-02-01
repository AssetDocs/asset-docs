# 🔐 Asset Safe Launch Security & Compliance Checklist

**Version:** 1.0  
**Last Updated:** February 2026  
**Platform:** Lovable Frontend + Supabase (Auth, Postgres, Storage) + Stripe

---

## How to Use This Checklist

- Work through each section systematically
- Mark items ✅ when complete (change ⬜ to ✅)
- Record Owner, Priority, and Status for each item
- All **P0** items must be ✅ before launch

---

## A) Identity & Access (Supabase Auth)

### ⬜ A1. Email Verification Required
| Field | Value |
|-------|-------|
| **What to verify** | Users must verify email before accessing protected features |
| **How to verify** | 1. Create test account → 2. Check `auth.users.email_confirmed_at` is NULL → 3. Click verification link → 4. Confirm timestamp populated |
| **Pass criteria** | Unverified users blocked from dashboard; `email_confirmed_at` populated after verification |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ A2. Password Policy Enforced
| Field | Value |
|-------|-------|
| **What to verify** | Passwords meet minimum security requirements (8+ chars, complexity) |
| **How to verify** | 1. Try signup with weak passwords (`123456`, `password`) → 2. Verify rejection → 3. Check Supabase Auth settings |
| **Pass criteria** | Weak passwords rejected; strong passwords accepted |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ A3. Session Management Secure
| Field | Value |
|-------|-------|
| **What to verify** | Sessions expire appropriately and tokens refresh correctly |
| **How to verify** | 1. Check `jwt_expiry` in config.toml (currently 3600s) → 2. Verify `autoRefreshToken: true` in client.ts → 3. Test session persistence across browser restart |
| **Pass criteria** | JWT expires in ≤1 hour; refresh works; logout clears all tokens |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ A4. 2FA Available for Users
| Field | Value |
|-------|-------|
| **What to verify** | TOTP-based 2FA can be enabled via account settings |
| **How to verify** | 1. Navigate to Account Settings → Security → 2. Enable TOTP → 3. Verify login requires code |
| **Pass criteria** | 2FA setup flow complete; login blocked without valid TOTP code |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ A5. OAuth Redirect URLs Restricted
| Field | Value |
|-------|-------|
| **What to verify** | Only authorized domains in `additional_redirect_urls` |
| **How to verify** | 1. Review `supabase/config.toml` → 2. Verify only production domains listed → 3. Remove localhost in production |
| **Pass criteria** | Only `assetsafe.net`, `assetsafenet.lovable.app` allowed |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

---

## B) Authorization (RLS + Role Model)

### ✅ B1. All User Tables Have RLS Enabled
| Field | Value |
|-------|-------|
| **What to verify** | Every table containing user/property data has RLS enabled with explicit policies |
| **How to verify** | Run: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;` |
| **Pass criteria** | Query returns 0 rows; all tables have RLS enabled |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ✅ Done |

### ✅ B2. No Open RLS Policies
| Field | Value |
|-------|-------|
| **What to verify** | No INSERT/UPDATE/DELETE policies use `USING(true)` or `WITH CHECK(true)` |
| **How to verify** | Run: `SELECT tablename, policyname FROM pg_policies WHERE (qual::text = 'true' OR with_check::text = 'true') AND cmd IN ('INSERT','UPDATE','DELETE','ALL');` |
| **Pass criteria** | Query returns 0 rows |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ✅ Done (Fixed Feb 2026) |

### ⬜ B3. Contributor Role Enforcement
| Field | Value |
|-------|-------|
| **What to verify** | Viewer/Contributor/Administrator roles enforced at database level |
| **How to verify** | 1. Invite test user as Viewer → 2. Attempt INSERT via Supabase client → 3. Verify rejection → 4. Check `has_contributor_access()` function |
| **Pass criteria** | Viewers: SELECT only; Contributors: SELECT/INSERT/UPDATE; Admins: all operations |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ B4. Cross-User Data Isolation
| Field | Value |
|-------|-------|
| **What to verify** | User A cannot access User B's data via API manipulation |
| **How to verify** | 1. Login as User A → 2. Capture User B's property ID → 3. Try to fetch: `supabase.from('properties').select().eq('id', userBPropertyId)` → 4. Verify empty result |
| **Pass criteria** | Cross-user queries return empty results or error |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ B5. Admin Role Separation
| Field | Value |
|-------|-------|
| **What to verify** | Admin roles stored in separate `user_roles` table (not in profiles) |
| **How to verify** | 1. Check `user_roles` table exists → 2. Verify `has_app_role()` function used in RLS → 3. Confirm no `is_admin` column on profiles |
| **Pass criteria** | Admin check uses `user_roles` table via security definer function |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

---

## C) File Storage Security (Supabase Storage)

### ✅ C1. Storage Buckets Private
| Field | Value |
|-------|-------|
| **What to verify** | `photos`, `videos`, `documents`, `floor-plans` buckets are NOT public |
| **How to verify** | 1. Supabase Dashboard → Storage → 2. Check each bucket's public setting → 3. All should show "Private" |
| **Pass criteria** | All content buckets marked private; only `public` bucket (if any) is public |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ✅ Done |

### ⬜ C2. Signed URLs with Short Expiration
| Field | Value |
|-------|-------|
| **What to verify** | File access uses signed URLs expiring in ≤1 hour |
| **How to verify** | 1. Review `useSignedUrl.ts` hook → 2. Check `expiresIn` parameter → 3. Test: generate URL, wait for expiry, verify 403 |
| **Pass criteria** | URLs expire within 3600 seconds; expired URLs return 403 |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ C3. Storage RLS Policies Enforced
| Field | Value |
|-------|-------|
| **What to verify** | Users can only access files in their own folder (`user_id/...`) |
| **How to verify** | 1. Query storage policies: `SELECT * FROM storage.policies;` → 2. Verify path_tokens[1] = auth.uid() check |
| **Pass criteria** | All bucket policies enforce user ownership via path |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ C4. File Type Validation
| Field | Value |
|-------|-------|
| **What to verify** | Only allowed file types accepted (images, videos, PDFs, docs) |
| **How to verify** | 1. Review `fileValidator.ts` → 2. Attempt upload of `.exe`, `.sh` files → 3. Verify rejection |
| **Pass criteria** | Executable files rejected; only whitelisted MIME types accepted |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ C5. File Size Limits Enforced
| Field | Value |
|-------|-------|
| **What to verify** | Upload size limited to prevent abuse (currently 50MB in config) |
| **How to verify** | 1. Check `supabase/config.toml` → `file_size_limit` → 2. Attempt 60MB upload → 3. Verify rejection |
| **Pass criteria** | Files >50MB rejected with appropriate error |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

---

## D) Payments (Stripe)

### ⬜ D1. Hosted Checkout Used
| Field | Value |
|-------|-------|
| **What to verify** | App uses Stripe Checkout (hosted) - never collects card data |
| **How to verify** | 1. Review `create-checkout` edge function → 2. Confirm `checkout.sessions.create()` used → 3. Verify no card inputs in frontend |
| **Pass criteria** | All payments redirect to Stripe-hosted pages; no PCI scope |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ D2. Customer Portal for Billing Management
| Field | Value |
|-------|-------|
| **What to verify** | Users manage subscriptions via Stripe Billing Portal |
| **How to verify** | 1. Review `customer-portal` edge function → 2. Test: logged-in user can access portal → 3. Verify cancel/update works |
| **Pass criteria** | Users access Stripe portal for all billing changes |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ D3. Webhook Signature Verification
| Field | Value |
|-------|-------|
| **What to verify** | Stripe webhooks verify signature before processing |
| **How to verify** | 1. Review `stripe-webhook/index.ts` → 2. Confirm `stripe.webhooks.constructEvent()` called → 3. Test with invalid signature |
| **Pass criteria** | Invalid signatures return 400; valid signatures processed |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ D4. Idempotency for Webhooks
| Field | Value |
|-------|-------|
| **What to verify** | Duplicate webhook events don't create duplicate records |
| **How to verify** | 1. Check `stripe_events` table for event_id uniqueness → 2. Send same webhook twice → 3. Verify single processing |
| **Pass criteria** | Duplicate events logged but not reprocessed |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ D5. Test vs Live Mode Separation
| Field | Value |
|-------|-------|
| **What to verify** | Production uses live Stripe keys; test keys only in development |
| **How to verify** | 1. Check Supabase secrets → 2. Verify `STRIPE_SECRET_KEY` is `sk_live_*` in production |
| **Pass criteria** | Live environment uses `sk_live_*` keys |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

---

## E) App Security Basics

### ⬜ E1. No Secrets in Frontend Code
| Field | Value |
|-------|-------|
| **What to verify** | No private API keys, secrets, or credentials in client-side code |
| **How to verify** | 1. Search codebase: `grep -r "sk_live\|sk_test\|secret" src/` → 2. Review `.env` file → 3. Verify only `VITE_SUPABASE_*` (public keys) exposed |
| **Pass criteria** | No private keys in `src/`; only publishable keys in client |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ E2. HTTPS Enforced
| Field | Value |
|-------|-------|
| **What to verify** | All traffic uses HTTPS; HTTP redirects to HTTPS |
| **How to verify** | 1. Try accessing `http://assetsafenet.lovable.app` → 2. Verify redirect to HTTPS → 3. Check HSTS header |
| **Pass criteria** | HTTP → HTTPS redirect; HSTS header present |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ E3. Security Headers Present
| Field | Value |
|-------|-------|
| **What to verify** | Response includes X-Frame-Options, X-Content-Type-Options, CSP |
| **How to verify** | 1. Review `security-headers` edge function → 2. Use browser DevTools → Network → Response Headers → 3. Verify headers present |
| **Pass criteria** | X-Frame-Options: DENY; X-Content-Type-Options: nosniff; CSP defined |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ E4. Protected Routes Require Auth
| Field | Value |
|-------|-------|
| **What to verify** | All dashboard routes check authentication; no sensitive data on public pages |
| **How to verify** | 1. Logout → 2. Try accessing `/properties`, `/documents`, `/account` → 3. Verify redirect to login |
| **Pass criteria** | Unauthenticated users redirected to login for all protected routes |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ E5. Input Sanitization
| Field | Value |
|-------|-------|
| **What to verify** | User inputs sanitized to prevent XSS attacks |
| **How to verify** | 1. Review usage of `DOMPurify` → 2. Test: enter `<script>alert('xss')</script>` in text fields → 3. Verify script not executed |
| **Pass criteria** | Malicious scripts sanitized; no XSS execution |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ E6. Rate Limiting Implemented
| Field | Value |
|-------|-------|
| **What to verify** | API endpoints protected against brute force/DDoS |
| **How to verify** | 1. Review `rate-limit-check` edge function → 2. Test rapid API calls → 3. Verify 429 response after threshold |
| **Pass criteria** | Rate limit triggers after threshold; 429 returned |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

---

## F) Monitoring & Audit

### ⬜ F1. Audit Logging Enabled
| Field | Value |
|-------|-------|
| **What to verify** | Critical actions logged to `audit_logs` table |
| **How to verify** | 1. Perform action (delete property) → 2. Query `audit_logs` → 3. Verify entry with user_id, action, timestamp |
| **Pass criteria** | DELETE, UPDATE on sensitive tables logged with user context |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ F2. Admin Actions Traceable
| Field | Value |
|-------|-------|
| **What to verify** | Admin dashboard actions logged separately |
| **How to verify** | 1. Admin performs action → 2. Check `audit_logs` for admin user_id → 3. Verify action recorded |
| **Pass criteria** | Admin actions identifiable in logs by user_id/role |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ F3. Error Monitoring Configured
| Field | Value |
|-------|-------|
| **What to verify** | Application errors captured for debugging (without exposing sensitive data) |
| **How to verify** | 1. Trigger intentional error → 2. Check error logging (console, edge function logs) → 3. Verify no PII in error messages |
| **Pass criteria** | Errors logged with context; no PII/secrets in logs |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ F4. Login Alerts for Suspicious Activity
| Field | Value |
|-------|-------|
| **What to verify** | Users notified of new device/location logins |
| **How to verify** | 1. Review `send-security-alert` edge function → 2. Login from new IP → 3. Verify email sent |
| **Pass criteria** | Security alert email sent on suspicious login patterns |
| **Owner** | Engineering |
| **Priority** | P2 |
| **Status** | ⬜ Not Started |

### ⬜ F5. Database Query Logging
| Field | Value |
|-------|-------|
| **What to verify** | Slow/failed queries logged for performance and security monitoring |
| **How to verify** | 1. Supabase Dashboard → Logs → Postgres → 2. Verify query logs present |
| **Pass criteria** | Failed queries visible in logs with error details |
| **Owner** | Engineering |
| **Priority** | P2 |
| **Status** | ⬜ Not Started |

---

## G) Privacy & Legal

### ⬜ G1. Privacy Policy Published
| Field | Value |
|-------|-------|
| **What to verify** | Privacy Policy accessible and covers data collection, storage, sharing |
| **How to verify** | 1. Navigate to `/terms` or footer Privacy link → 2. Verify document covers: data types, storage location, third parties, retention |
| **Pass criteria** | Privacy Policy live and comprehensive |
| **Owner** | Legal/Product |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ G2. Terms of Service Published
| Field | Value |
|-------|-------|
| **What to verify** | Terms of Service accessible and covers user responsibilities, liability |
| **How to verify** | 1. Navigate to Terms link → 2. Verify acceptance required at signup |
| **Pass criteria** | ToS live; checkbox required at signup |
| **Owner** | Legal/Product |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ G3. Data Export Available
| Field | Value |
|-------|-------|
| **What to verify** | Users can export their data (GDPR/CCPA compliance) |
| **How to verify** | 1. Go to Account Settings → 2. Find Export Data option → 3. Download and verify contents |
| **Pass criteria** | Export includes all user data in readable format (JSON/CSV) |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ G4. Account Deletion Process
| Field | Value |
|-------|-------|
| **What to verify** | Users can request account deletion with grace period |
| **How to verify** | 1. Account Settings → Delete Account → 2. Verify grace period (14 days) → 3. Check `delete-account` edge function |
| **Pass criteria** | Deletion request logged; data purged after grace period |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ G5. Cookie Consent Banner
| Field | Value |
|-------|-------|
| **What to verify** | Cookie consent shown; preferences respected |
| **How to verify** | 1. Clear cookies → 2. Visit site → 3. Verify consent banner → 4. Check cookies set only after consent |
| **Pass criteria** | Non-essential cookies blocked until consent given |
| **Owner** | Engineering |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

---

## H) Incident Readiness

### ⬜ H1. Incident Response Plan Documented
| Field | Value |
|-------|-------|
| **What to verify** | Written plan for security incidents with roles and steps |
| **How to verify** | 1. Review incident response document → 2. Verify contact list current → 3. Confirm escalation path defined |
| **Pass criteria** | Document exists with: detection, containment, notification, recovery steps |
| **Owner** | Security Lead |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ H2. Breach Notification Process
| Field | Value |
|-------|-------|
| **What to verify** | Process to notify affected users within legal timeframes |
| **How to verify** | 1. Draft notification template → 2. Verify email capability for mass notification → 3. Document regulatory requirements |
| **Pass criteria** | Template ready; mass email capability tested; 72-hour SLA documented |
| **Owner** | Legal/Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ H3. Backup & Recovery Tested
| Field | Value |
|-------|-------|
| **What to verify** | Database backups exist and restoration tested |
| **How to verify** | 1. Supabase Dashboard → Settings → Backups → 2. Verify PITR enabled → 3. Document restoration steps |
| **Pass criteria** | Daily backups confirmed; restoration procedure documented |
| **Owner** | Engineering |
| **Priority** | P0 |
| **Status** | ⬜ Not Started |

### ⬜ H4. Security Contact Published
| Field | Value |
|-------|-------|
| **What to verify** | security@assetsafe.net or similar contact published for vulnerability reports |
| **How to verify** | 1. Check website footer/contact page → 2. Verify email monitored |
| **Pass criteria** | Security contact visible; inbox monitored |
| **Owner** | Security Lead |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

---

## I) Vulnerability Scanning (OWASP ZAP)

### ⬜ I1. Automated Spider Scan
| Field | Value |
|-------|-------|
| **What to verify** | All public pages crawled and scanned for vulnerabilities |
| **How to verify** | 1. Install OWASP ZAP → 2. Set target: `https://assetsafenet.lovable.app` → 3. Run Spider → 4. Review discovered URLs |
| **Pass criteria** | Spider completes; all public URLs discovered |
| **Owner** | Security Lead |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ I2. Active Scan Completed
| Field | Value |
|-------|-------|
| **What to verify** | Active vulnerability scan run against test environment |
| **How to verify** | 1. OWASP ZAP → Active Scan (on test/staging only) → 2. Review High/Medium findings → 3. Document remediation |
| **Pass criteria** | No High severity findings; Medium findings documented with remediation plan |
| **Owner** | Security Lead |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ I3. Authenticated Scan Completed
| Field | Value |
|-------|-------|
| **What to verify** | Scan includes authenticated user flows |
| **How to verify** | 1. Configure ZAP authentication context → 2. Run spider/scan as logged-in user → 3. Review protected endpoint findings |
| **Pass criteria** | Authenticated pages scanned; no auth bypass vulnerabilities |
| **Owner** | Security Lead |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

### ⬜ I4. API Endpoint Scan
| Field | Value |
|-------|-------|
| **What to verify** | Supabase edge functions scanned for vulnerabilities |
| **How to verify** | 1. Export OpenAPI/Postman collection → 2. Import to ZAP → 3. Run API scan → 4. Review findings |
| **Pass criteria** | No injection vulnerabilities; proper auth enforcement confirmed |
| **Owner** | Security Lead |
| **Priority** | P1 |
| **Status** | ⬜ Not Started |

---

## 🚦 Launch Gate Checklist

**Before going live, ALL of the following P0 items MUST be ✅:**

| # | Item | Section | Status |
|---|------|---------|--------|
| 1 | Email Verification Required | A1 | ⬜ |
| 2 | Password Policy Enforced | A2 | ⬜ |
| 3 | Session Management Secure | A3 | ⬜ |
| 4 | OAuth Redirect URLs Restricted | A5 | ⬜ |
| 5 | All User Tables Have RLS Enabled | B1 | ✅ |
| 6 | No Open RLS Policies | B2 | ✅ |
| 7 | Contributor Role Enforcement | B3 | ⬜ |
| 8 | Cross-User Data Isolation | B4 | ⬜ |
| 9 | Admin Role Separation | B5 | ⬜ |
| 10 | Storage Buckets Private | C1 | ✅ |
| 11 | Signed URLs with Short Expiration | C2 | ⬜ |
| 12 | Storage RLS Policies Enforced | C3 | ⬜ |
| 13 | Hosted Checkout Used | D1 | ⬜ |
| 14 | Customer Portal for Billing | D2 | ⬜ |
| 15 | Webhook Signature Verification | D3 | ⬜ |
| 16 | Idempotency for Webhooks | D4 | ⬜ |
| 17 | Test vs Live Mode Separation | D5 | ⬜ |
| 18 | No Secrets in Frontend Code | E1 | ⬜ |
| 19 | HTTPS Enforced | E2 | ⬜ |
| 20 | Protected Routes Require Auth | E4 | ⬜ |
| 21 | Input Sanitization | E5 | ⬜ |
| 22 | Audit Logging Enabled | F1 | ⬜ |
| 23 | Admin Actions Traceable | F2 | ⬜ |
| 24 | Privacy Policy Published | G1 | ⬜ |
| 25 | Terms of Service Published | G2 | ⬜ |
| 26 | Account Deletion Process | G4 | ⬜ |
| 27 | Incident Response Plan | H1 | ⬜ |
| 28 | Breach Notification Process | H2 | ⬜ |
| 29 | Backup & Recovery Tested | H3 | ⬜ |

**Launch Gate:** ≥29/29 P0 items ✅ required for production launch

---

## Appendix: Quick Reference Commands

### Database Security Checks
```sql
-- Check RLS enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Find permissive policies
SELECT tablename, policyname, cmd, qual::text, with_check::text
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (qual::text = 'true' OR with_check::text = 'true');

-- Verify admin role stored correctly
SELECT * FROM public.user_roles WHERE role = 'admin';
```

### Storage Security Checks
```sql
-- Check bucket policies
SELECT * FROM storage.policies ORDER BY name;

-- Check bucket visibility
SELECT id, name, public FROM storage.buckets;
```

---

**Document Owner:** Engineering/Security Team  
**Review Cadence:** Quarterly or after major releases
