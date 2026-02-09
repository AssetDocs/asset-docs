

# Unified Upload with Smart Type Routing

## The Idea

When users tap the primary **"+ Upload"** button on the Asset Documentation page, they are immediately presented with an expanded type selector (similar to the existing `DocumentTypeSelector`) that now includes **Photos** and **Videos** as options alongside the document types. Based on their selection, they are routed to the correct upload form.

## How It Works for Users

1. User taps **"+ Upload"** on the Asset Documentation landing page
2. A dialog opens: **"What are you uploading?"** with a grid of options:
   - **Photo** -- routes to the Photos & Videos upload form (photo tab)
   - **Video** -- routes to the Photos & Videos upload form (video tab)
   - **Insurance Policy** -- routes to the dedicated Insurance Policy form (`/account/insurance/new`) with its specialized fields (policy number, agent, premium, deductible, etc.)
   - **Insurance Claim** -- routes to the Document Upload form
   - **Warranty** -- routes to the Document Upload form
   - **Receipt** -- routes to the Document Upload form
   - **Inspection Report** -- routes to the Document Upload form
   - **Appraisal** -- routes to the Document Upload form
   - **Title / Deed** -- routes to the Document Upload form
   - **Other Document** -- routes to the Document Upload form
3. Each type gets the correct upload experience with the right fields

## Why This Approach

- **Insurance Policy** has a dedicated form with 15+ specialized fields (company, policy number, agent contact, premium, deductible, coverage amount, dates, etc.) that writes to the `insurance_policies` table -- not a generic file upload. Merging this into a single form would be confusing.
- **Photos/Videos** write to `property_files` with media-specific metadata.
- **Documents** write to `user_documents` with document-type tagging.
- A single "mega form" trying to handle all three would be cluttered. The type selector acts as a smart router instead.

## Technical Details

### Files to Modify

**1. `src/components/DocumentTypeSelector.tsx`** -- Expand into an `AssetTypeSelector`
- Rename the component (or create new) to `AssetTypeSelector`
- Add two new options at the top of the grid: **Photo** (Camera icon) and **Video** (Video icon)
- Update the `DocumentType` union to include `'photo' | 'video'`
- Update dialog title to "What are you uploading?"

**2. `src/components/AssetDocumentationGrid.tsx`** -- Add the upload button
- Add a prominent "+ Upload" button above the two gallery cards
- On click, open the `AssetTypeSelector` dialog
- Handle selection routing:
  - `photo` --> navigate to `/account/media/upload` (photos tab)
  - `video` --> navigate to `/account/media/upload` (videos tab)
  - `insurance_policy` --> navigate to `/account/insurance/new`
  - All other document types --> navigate to `/account/documents/upload?type={type}`

### Routing Logic (in AssetDocumentationGrid)

```text
User taps "+ Upload"
  |
  +--> AssetTypeSelector dialog opens
  |
  +--> Photo selected     --> /account/media/upload?tab=photos
  +--> Video selected     --> /account/media/upload?tab=videos
  +--> Insurance Policy   --> /account/insurance/new
  +--> Any other doc type --> /account/documents/upload?type={type}
```

### No Other Changes Needed

- The existing `CombinedMediaUpload`, `DocumentUpload`, and `InsuranceForm` pages all remain as-is
- The two gallery cards (Photos & Videos / Documents & Records) remain for browsing existing files
- No database changes required
