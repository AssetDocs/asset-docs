import { CalendarEventCategory } from '@/hooks/useCalendarEvents';

export const CATEGORY_LABELS: Record<CalendarEventCategory, string> = {
  home_property: 'Home & Property',
  maintenance_care: 'Maintenance & Care',
  utilities_household: 'Utilities & Household',
  appliances_systems: 'Appliances & Systems',
  warranties_coverage: 'Warranties & Coverage',
  property_lifecycle: 'Property Lifecycle',
  compliance_filings: 'Compliance & Filings',
  equipment_assets: 'Equipment & Assets',
  subscriptions_auto_drafts: 'Subscriptions & Auto-Drafts',
  hr_admin: 'HR & Admin',
  tenant_lifecycle: 'Tenant Lifecycle',
  inspections_turnover: 'Inspections & Turnover',
  rent_financial: 'Rent & Financial',
  legal_compliance: 'Legal & Compliance',
  legal_document_reviews: 'Legal Document Reviews',
  authorized_user_reviews: 'Authorized User Reviews',
  legacy_emergency_planning: 'Legacy & Emergency Planning',
};

export const CATEGORY_GROUPS: { label: string; categories: CalendarEventCategory[] }[] = [
  {
    label: 'Home & Property',
    categories: ['home_property', 'maintenance_care', 'utilities_household', 'appliances_systems', 'warranties_coverage', 'property_lifecycle'],
  },
  {
    label: 'Business & Operations',
    categories: ['compliance_filings', 'equipment_assets', 'subscriptions_auto_drafts', 'hr_admin'],
  },
  {
    label: 'Landlord & Rental',
    categories: ['tenant_lifecycle', 'inspections_turnover', 'rent_financial', 'legal_compliance'],
  },
  {
    label: 'Estate & Legacy',
    categories: ['legal_document_reviews', 'authorized_user_reviews', 'legacy_emergency_planning'],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  // Home & Property group: blue shades
  home_property: 'bg-blue-100 text-blue-700 border-blue-200',
  maintenance_care: 'bg-blue-50 text-blue-600 border-blue-200',
  utilities_household: 'bg-sky-100 text-sky-700 border-sky-200',
  appliances_systems: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  warranties_coverage: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  property_lifecycle: 'bg-blue-100 text-blue-800 border-blue-300',
  // Business & Operations group: green shades
  compliance_filings: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  equipment_assets: 'bg-green-100 text-green-700 border-green-200',
  subscriptions_auto_drafts: 'bg-teal-100 text-teal-700 border-teal-200',
  hr_admin: 'bg-lime-100 text-lime-700 border-lime-200',
  // Landlord & Rental group: purple shades
  tenant_lifecycle: 'bg-purple-100 text-purple-700 border-purple-200',
  inspections_turnover: 'bg-violet-100 text-violet-700 border-violet-200',
  rent_financial: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  legal_compliance: 'bg-purple-50 text-purple-600 border-purple-200',
  // Estate & Legacy group: amber shades
  legal_document_reviews: 'bg-amber-100 text-amber-700 border-amber-200',
  authorized_user_reviews: 'bg-orange-100 text-orange-700 border-orange-200',
  legacy_emergency_planning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export const CATEGORY_BORDER_COLORS: Record<string, string> = {
  home_property: 'border-l-blue-500',
  maintenance_care: 'border-l-blue-400',
  utilities_household: 'border-l-sky-500',
  appliances_systems: 'border-l-cyan-500',
  warranties_coverage: 'border-l-indigo-500',
  property_lifecycle: 'border-l-blue-600',
  compliance_filings: 'border-l-emerald-500',
  equipment_assets: 'border-l-green-500',
  subscriptions_auto_drafts: 'border-l-teal-500',
  hr_admin: 'border-l-lime-500',
  tenant_lifecycle: 'border-l-purple-500',
  inspections_turnover: 'border-l-violet-500',
  rent_financial: 'border-l-fuchsia-500',
  legal_compliance: 'border-l-purple-400',
  legal_document_reviews: 'border-l-amber-500',
  authorized_user_reviews: 'border-l-orange-500',
  legacy_emergency_planning: 'border-l-yellow-500',
};

export const CATEGORY_DOT_COLORS: Record<string, string> = {
  home_property: 'bg-blue-500',
  maintenance_care: 'bg-blue-400',
  utilities_household: 'bg-sky-500',
  appliances_systems: 'bg-cyan-500',
  warranties_coverage: 'bg-indigo-500',
  property_lifecycle: 'bg-blue-600',
  compliance_filings: 'bg-emerald-500',
  equipment_assets: 'bg-green-500',
  subscriptions_auto_drafts: 'bg-teal-500',
  hr_admin: 'bg-lime-500',
  tenant_lifecycle: 'bg-purple-500',
  inspections_turnover: 'bg-violet-500',
  rent_financial: 'bg-fuchsia-500',
  legal_compliance: 'bg-purple-400',
  legal_document_reviews: 'bg-amber-500',
  authorized_user_reviews: 'bg-orange-500',
  legacy_emergency_planning: 'bg-yellow-500',
};
