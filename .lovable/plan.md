
## Root Cause (from the logs)

Two bugs are firing in sequence:

**Bug 1 — `POST /auth/v1/admin/invite` returns HTTP 404**
The auth log shows:
```
"path":"/admin/invite","status":"404"
```
The `/auth/v1/admin/invite` endpoint is not resolving correctly. This can happen when the Supabase project's GoTrue version doesn't support that exact path, or there's a routing mismatch. The endpoint returns a plain-text `404 page not found` body.

**Bug 2 — `inviteRes.json()` called on a non-JSON 404 body → crash**
Line 133 of the function is unconditional:
```ts
const inviteData = await inviteRes.json(); // ← throws SyntaxError if body is plain text
```
The log shows:
```
"Unexpected non-whitespace character after JSON at position 4"
```
This `SyntaxError` is thrown **before** the `if (!inviteRes.ok)` check, so the entire function crashes and falls into the `catch` block — which returns a 500. The contributor row was already inserted into the DB at that point (line 76-96 ran fine), so the frontend's catch handler correctly shows "invitation recorded but email could not be sent."

---

## The Fix

### Change 1 — `supabase/functions/invite-contributor/index.ts`

**Two fixes in one:**

1. **Safe JSON parsing** — Read the response as text first, try to parse as JSON, and handle the case where it's not JSON. This prevents the crash and gives us proper fallback logic.

2. **Fallback when `/admin/invite` returns 404** — When the native invite endpoint fails (404 or any other non-OK status that isn't "already registered"), fall back to the proven `generate_link` approach that was working before:
   - `POST /auth/v1/admin/users` with `email_confirm: true` to create the user
   - `POST /auth/v1/admin/generate_link` with `type: 'invite'` to get the action_link

The fallback strategy:
```
POST /auth/v1/admin/invite (try first)
  → 200 OK → use action_link ✓
  → 404 or other error → fallback:
      POST /auth/v1/admin/users (create with email_confirm: true)
      POST /auth/v1/admin/generate_link type='invite' → get action_link
  → "already registered" → check password_set → magiclink or plain link
```

This means the function is resilient regardless of which Supabase endpoint version is available.

### Files to change

| File | Change |
|------|--------|
| `supabase/functions/invite-contributor/index.ts` | Wrap `inviteRes.json()` in safe text→JSON parse; add fallback to `createUser + generate_link(invite)` when `/admin/invite` returns 404 |

No frontend changes needed — the frontend's catch handler already shows the right message for edge function errors; once the edge function stops throwing, `data.success = true` will flow through and show the success toast instead.
