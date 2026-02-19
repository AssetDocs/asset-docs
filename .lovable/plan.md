

## Remove Construction Banner and Move Video Help to Footer

### Changes Overview

1. **Remove the "Under Construction" banner** from the homepage by deleting the `UnderConstructionBanner` import and usage in `src/pages/Index.tsx`.

2. **Remove all "Video Help" nav links** from `src/components/Navbar.tsx` -- there are 4 instances (desktop authenticated, desktop unauthenticated, mobile authenticated, mobile unauthenticated).

3. **Add "Video Help" link to the Footer** in `src/components/Footer.tsx`, placed under the existing "Support" subsection alongside Q&A, Contact, and Install App.

### Technical Details

**File: `src/pages/Index.tsx`**
- Remove the `import UnderConstructionBanner` line
- Remove `<UnderConstructionBanner />` from the JSX

**File: `src/components/Navbar.tsx`**
- Remove the 4 `NavLink` blocks pointing to `/video-help` (lines ~90-98, ~160-168, ~267-276, ~345-354)
- The `Video` icon import from lucide-react can also be removed if no longer used elsewhere in the file

**File: `src/components/Footer.tsx`**
- Add a new list item under the "Support" section:
```
<li>
  <Link to="/video-help" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
    <Video className="h-3 w-3" />
    Video Help
  </Link>
</li>
```
- Import `Video` from `lucide-react`

No database changes or new files required.
