

## Memory Safe - Full UI Implementation

### Overview
Transform the Memory Safe page from a "Coming Soon" placeholder into a fully functional media management interface that mirrors the Documents & Records section. Users will be able to create folders, upload memories (photos/files), view thumbnails with dates and titles, and manage their files with the same controls available in Asset Documentation.

### Database Changes

**1. Create `memory_safe_folders` table**
- Mirrors `document_folders` schema: id, user_id, folder_name, description, gradient_color, created_at, updated_at
- RLS policies: users can only CRUD their own folders

**2. Create `memory_safe_items` table**
- Mirrors `user_documents` schema: id, user_id, file_name, file_path, file_url, file_size, file_type, title (display name), description, tags, folder_id, created_at, updated_at
- RLS policies: users can only CRUD their own items

**3. Create `memory-safe` storage bucket**
- Private bucket (matching the pattern of photos/videos/documents buckets)
- RLS policies allowing authenticated users to manage their own files

### Frontend Changes

**1. Rewrite `src/components/MemorySafe.tsx`**
Replace the placeholder with a full-featured page matching the Documents & Records layout:
- Header: "Memory Safe" title + subtitle + "+ Add Memory" button (full-width, brand-blue)
- 1/4 + 3/4 grid layout:
  - Left sidebar: `DocumentFolders` component (reused) labeled "Memory Organization" with "All Memories" default option
  - Right content: `MediaGalleryGrid` component (reused) showing memory thumbnails with date, title, size
- Sort controls (Newest/Oldest/Name A-Z/Z-A) and Grid/List view toggle inside the content card header
- Select All / Deselect / Bulk Delete controls
- Folder CRUD: create, edit, delete folders via existing `CreateFolderModal` and `EditFolderModal`
- File delete confirmation via existing `DeleteConfirmationDialog`

**2. Create `src/pages/MemoryUpload.tsx`**
- A dedicated upload page for adding memories to the safe
- File upload input (photos, documents, etc.) uploading to the `memory-safe` storage bucket
- Fields: Title, Description, Tags, Folder selection
- Saves metadata to `memory_safe_items` table
- Navigation: Back to Memory Safe

**3. Create `src/pages/MemoryEdit.tsx`**
- Edit page for existing memory items (title, description, tags, folder)
- Matches the pattern of existing media edit pages

**4. Update `src/pages/Account.tsx`**
- Add routes/tab handling for memory upload and edit if needed

**5. Update `src/App.tsx`**
- Add routes: `/account/memory-safe/upload` and `/account/memory-safe/:id/edit`

### Technical Details

**Reused components (no modifications needed):**
- `DocumentFolders` - sidebar folder navigation (parameterized title via props or wrapper)
- `MediaGalleryGrid` - thumbnail grid/list with view, download, edit, delete actions
- `MediaThumbnail` - signed URL generation for private bucket previews
- `CreateFolderModal` - folder creation dialog
- `EditFolderModal` - folder editing dialog
- `DeleteConfirmationDialog` - delete confirmation
- `DashboardBreadcrumb` - navigation breadcrumb

**Data flow:**
- Memories stored in `memory-safe` private storage bucket
- Metadata stored in `memory_safe_items` table
- Folders stored in `memory_safe_folders` table
- Signed URLs generated via `MediaThumbnail` for secure preview

**Files to create:**
- SQL migration for `memory_safe_folders`, `memory_safe_items` tables and `memory-safe` bucket
- `src/pages/MemoryUpload.tsx`
- `src/pages/MemoryEdit.tsx`

**Files to modify:**
- `src/components/MemorySafe.tsx` (complete rewrite)
- `src/App.tsx` (add routes)
- `src/pages/Account.tsx` (if needed for tab routing)

