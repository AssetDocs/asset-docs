

## Harden the Authorized User Invitation Flow

### Current State (Working — Fixed)

The token-based invitation flow is fully functional for all 3 roles. Both `invite-contributor` and `complete-contributor-signup` use a **create-first approach** with `listUsers` email filter fallback — NOT the broken direct REST API lookup which returned all users instead of filtering by email.

### User Lookup Strategy (CANONICAL — DO NOT CHANGE)

```typescript
// 1. Try createUser first
const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({ ... });

// 2. If user already exists (422), find via listUsers + strict email filter
if (createError?.message?.includes('already been registered')) {
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const found = userList?.users?.find(u => u.email === targetEmail);
}
```

**DO NOT** use `/auth/v1/admin/users?email=...` — it does NOT filter by email and returns ALL users.

### Role Access Summary (already implemented, no changes needed)

| Role | canEdit | canDelete | canAccessSettings | canAccessEncryptedVault |
|------|---------|-----------|-------------------|------------------------|
| viewer | No | No | No | No |
| contributor | Yes | No | No | No |
| administrator | Yes | Yes | Yes | Yes |
