
## Plan: Access & Activity Page Updates

### What needs to change in `src/components/AccessActivitySection.tsx`

**1. Collapse "Understanding Authorized User Roles"**
Wrap the entire Card in a `Collapsible` (already used in `PeopleActivityCard`). Default `open={false}`. The `CardHeader` row becomes the trigger, with a chevron toggle icon.

**2. Remove "Role Permissions" section**
This is the amber `<Alert>` inside `ContributorsTab` at lines 330–336 of `ContributorsTab.tsx` that reads *"Legacy Locker Access: Only users with the Administrator role can access..."*. Remove it — it duplicates the role description card above.

**3. Collapse "Recent Activity"**
Same pattern as item 1 — wrap the Recent Activity Card in a `Collapsible`, default closed, chevron in the header.

**4. Fix Administrator description (accurate vault access)**

Current text (incorrect):
```
• Can view and manage the Legacy Locker
• Can access the Password Catalog
```

**What actually happens** (from `SecureVault.tsx` and `ContributorContext.tsx`):
- Administrators get **direct access** to the Secure Vault (Digital Access + Legacy Locker) **as long as the account owner has not revoked admin access** via the `allow_admin_access` toggle.
- There is NO recovery-request waiting period for administrators — that flow is only for designated **Trusted Delegates** who are not active contributors.
- Administrators also need to pass the **TOTP challenge** and enter the **Master Password** to unlock the encrypted vault (same as the account owner).

Replace the two bullet points with accurate descriptions:

```
• Can access the Secure Vault — Digital Access (Password Catalog) 
  and Legacy Locker — if the account owner has enabled admin access
• Must pass the MFA challenge and enter the Master Password 
  to unlock encrypted vault contents
• The account owner can revoke Secure Vault access for administrators 
  at any time from their vault settings
```

---

### Files to change

| File | Change |
|------|--------|
| `src/components/AccessActivitySection.tsx` | Wrap Role Explanations card in Collapsible (default closed); wrap Recent Activity card in Collapsible (default closed); update Administrator bullet points |
| `src/components/ContributorsTab.tsx` | Remove the amber "Legacy Locker Access" Alert (lines 330–336) |

---

### Implementation detail

Both collapsibles use the same pattern already in `PeopleActivityCard`:
```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

const [rolesOpen, setRolesOpen] = useState(false);
const [activityOpen, setActivityOpen] = useState(false);

// The CardHeader row itself becomes the trigger:
<Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
  <CollapsibleTrigger asChild>
    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
      <CardTitle className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Understanding Authorized User Roles
        </span>
        {rolesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CardTitle>
    </CardHeader>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <CardContent>...</CardContent>
  </CollapsibleContent>
</Collapsible>
```
