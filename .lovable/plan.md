
## Secure Vault Banner — Text Update + Encryption Badge Migration

### Changes to `src/components/DashboardGrid.tsx`

**1. Update banner subtitle text (line 135)**

From:
`Your most sensitive information — protected with advanced encryption.`

To:
`A single encrypted space for digital access and legacy planning.`

**2. Move the encryption badge into the banner**

Add the `vaultBadge` / `vaultBadgeIcon` display directly inside the banner `div`, to the right of the text. This renders once, representing the shared encryption state for both vault sections.

The badge in the banner will reuse the same inline-flex pill style already used in `DashboardGridCard`:
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wide border border-amber-200">
  {vaultBadgeIcon}
  {vaultBadge}
</span>
```

**3. Remove `badge` and `badgeIcon` props from both vault cards (lines 149–150 and 162–163)**

Since the encryption status is now shown once in the shared banner, it no longer needs to appear on each individual card.

### Result

```
┌──────────────────────────────────────────────────────────────────┐
│  🔒 Secure Vault                              [🔒 Encrypted]     │
│  A single encrypted space for digital access and legacy planning.│
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────┐  ┌───────────────────────────────────────┐
│  Legacy Locker       │  │  Digital Access                       │
│  (no badge)          │  │  (no badge)                           │
└──────────────────────┘  └───────────────────────────────────────┘
```

### Files Changed
- `src/components/DashboardGrid.tsx` — 3 targeted edits (banner text, banner badge, remove per-card badges)
