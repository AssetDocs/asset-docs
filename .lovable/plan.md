## Signed-in mobile navigation + homepage redirect

Note on route naming: the app's dashboard route is **`/account`** (per project memory and existing Navbar — there is no `/dashboard` route). The plan follows the user's intent ("Dashboard") but targets `/account`.

### 1. Redirect signed-in users from `/` → `/account`

In `src/pages/Index.tsx`:

- Read `{ user, loading }` from `useAuth()`.
- While `loading` is `true`, render the existing homepage as-is (no flash, no premature redirect).
- Once `loading` is `false` and `user` is truthy, return `<Navigate to="/account" replace />` from `react-router-dom`.
- Signed-out users continue to see the full marketing homepage unchanged.

Scope: only `Index.tsx` (the `/` route). Other public pages (`/about`, `/features`, `/pricing`, `/gift`, `/blog`, legal, etc.) are untouched, so signed-in users who navigate to them intentionally stay put.

### 2. Mobile "Dashboard" CTA in the header

In `src/components/Navbar.tsx`, inside the mobile block (`<div className="md:hidden flex items-center gap-2">`, around line 178):

- Add a signed-in branch mirroring the existing signed-out mobile buttons:
  - When `isAuthenticated` is true AND the current path is not `/account` (checked via `useLocation()`), render a compact orange Dashboard button:
    ```
    <Button asChild size="sm"
      className="bg-brand-orange hover:bg-brand-orange/90 text-xs px-2 py-1 h-8">
      <Link to="/account" aria-label="Go to Dashboard">
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Link>
    </Button>
    ```
  - Placed immediately before the hamburger button so the header reads: `Logo | Dashboard | Menu`.
- Hide the CTA when already on `/account` (or any `/account/*` subpath) to avoid duplication with the page the user is on.
- Signed-out mobile header behavior (Login + Get Started buttons) is unchanged.
- Desktop nav is untouched — the existing desktop Dashboard NavLink for signed-in users stays exactly as it is.
- The hamburger menu's signed-in Dashboard entry stays in place as the redundant/menu path.

### Out of scope
- No changes to auth flow, routing config, dashboard layout, subscription logic, or public page access.
- No `/dashboard` route is added; existing `/account` route is reused (matches current desktop nav and project memory).

### Files touched
- `src/pages/Index.tsx` — add auth-gated redirect at top of component.
- `src/components/Navbar.tsx` — add mobile signed-in Dashboard button + `useLocation` guard.
