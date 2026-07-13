## Update pricing feature lists across all three surfaces

Replace `"Service Pros Directory"` with `"Family Archive"`, and add `"Property Profiles"` and `"Insights & Tools"` to the features array in each file:

### 1. `src/pages/Pricing.tsx` (lines 146–159, `unifiedFeatures`)

### 2. `src/pages/CompletePricing.tsx` (line 97, `commonFeatures`)

### 3. `src/components/ManageTab.tsx` (line 47, plan `features`)

Final feature order in each list (trailing entries):

```
...
MFA, full web platform access
Family Archive
Property Profiles
Insights & Tools
```

No other logic, styling, or copy changes.
