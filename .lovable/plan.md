Remove "Records" from the Knowledge Hub page header subtitle.

## What to change
- In `src/pages/Account.tsx`, update the `knowledge-hub` tab title/subtitle object so the subtitle reads:
  `Contacts · Notes · Property Details · Memories`
  (drop the `Records ·` segment).

## What to leave alone
- Keep all other occurrences of "records" intact: dashboard card tags, Voice Notes subtitle, Smart Calendar description, PDF summary copy, etc.

## Verification
- After the edit, the Knowledge Hub panel header (`/account?tab=knowledge-hub`) should display only the four items above with no "Records" mention.
