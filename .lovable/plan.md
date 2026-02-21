

## Add Tax Return Organizer and Financial Loans to Insights & Tools

### Overview
Two new sections will be added to the Insights & Tools grid on the dashboard. Both will follow the existing patterns used by Documents, Photos, and other sections -- including folder organization, file uploads with metadata, and the standard card-based UI.

---

### 1. Database Changes (2 new tables + 2 folder tables)

**`tax_return_folders`** -- stores user-created folders for organizing tax returns
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- folder_name (text, NOT NULL)
- description (text, nullable)
- gradient_color (text, default 'bg-blue-500')
- display_order (integer, default 0)
- created_at (timestamptz)

**`tax_returns`** -- stores individual tax return documents with metadata
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- folder_id (uuid, nullable, FK to tax_return_folders)
- title (text, NOT NULL)
- tax_year (text, nullable) -- e.g. "2024"
- notes (text, nullable)
- file_name (text, nullable)
- file_path (text, nullable)
- file_url (text, nullable)
- file_size (bigint, nullable)
- file_type (text, nullable)
- bucket_name (text, default 'documents')
- tags (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

**`financial_loan_folders`** -- stores user-created folders for organizing loans
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- folder_name (text, NOT NULL)
- description (text, nullable)
- gradient_color (text, default 'bg-blue-500')
- display_order (integer, default 0)
- created_at (timestamptz)

**`financial_loans`** -- stores individual loan records with metadata
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- folder_id (uuid, nullable, FK to financial_loan_folders)
- loan_type (text, nullable) -- e.g. "Mortgage", "Auto", "Personal", "Student", "Business", "Other"
- institution (text, nullable)
- loan_terms (text, nullable) -- e.g. "30-year fixed"
- total_amount (numeric, nullable)
- apr (numeric, nullable)
- monthly_payment (numeric, nullable)
- start_date (date, nullable)
- maturity_date (date, nullable)
- account_number (text, nullable)
- notes (text, nullable)
- file_name (text, nullable)
- file_path (text, nullable)
- file_url (text, nullable)
- file_size (bigint, nullable)
- file_type (text, nullable)
- bucket_name (text, default 'documents')
- status (text, default 'active') -- active, paid_off, defaulted
- created_at (timestamptz)
- updated_at (timestamptz)

All 4 tables will have RLS enabled with policies restricting access to the owning user only (matching existing patterns like `paint_codes`, `source_websites`, etc.).

---

### 2. New Components

**`src/components/TaxReturnOrganizer.tsx`** -- Main section component
- Full-width blue "+ Upload Document" button at the top
- Sidebar folder panel using the existing `DocumentFolders` component pattern (with custom labels)
- Document list showing saved tax returns with title, tax year, notes, and file info
- Upload modal/form with fields: Title, Tax Year, Notes, File upload, Tags
- Edit and delete capabilities on saved entries

**`src/components/FinancialLoans.tsx`** -- Main section component
- Full-width blue "+ Add Loan" button at the top
- Sidebar folder panel for organizing loans
- Loan list showing saved records with type, institution, amount, APR, etc.
- Add/Edit form with fields: Loan Type (dropdown), Institution, Terms, Total Amount, APR, Monthly Payment, Start Date, Maturity Date, Account Number, Notes, File upload
- Edit and delete capabilities on saved entries

---

### 3. Integration Points

**`src/components/InsightsToolsGrid.tsx`**
- Add two new `DashboardGridCard` entries:
  - "Tax Return Organizer" with a `Receipt` or `FileSpreadsheet` icon
  - "Financial Loans" with a `Banknote` or `Landmark` icon
- Both will call `onTabChange('tax-returns')` and `onTabChange('financial-loans')` respectively

**`src/pages/Account.tsx`**
- Add section configs for `'tax-returns'` and `'financial-loans'` in `getSectionConfig()`
- Add two new `TabsContent` blocks rendering the new components

---

### 4. File Summary

| File | Action |
|------|--------|
| DB migration | Create 4 tables with RLS |
| `src/components/TaxReturnOrganizer.tsx` | Create |
| `src/components/FinancialLoans.tsx` | Create |
| `src/components/InsightsToolsGrid.tsx` | Edit -- add 2 cards |
| `src/pages/Account.tsx` | Edit -- add tab configs and content |

