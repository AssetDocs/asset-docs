import { CalendarEventCategory, CalendarEventRecurrence } from '@/hooks/useCalendarEvents';

export interface EventTemplate {
  key: string;
  title: string;
  category: CalendarEventCategory;
  recurrence: CalendarEventRecurrence;
  notify_day_of: boolean;
  notify_1_week: boolean;
  notify_30_days: boolean;
}

export const TEMPLATE_GROUPS: { label: string; templates: EventTemplate[] }[] = [
  {
    label: 'Homeowner',
    templates: [
      { key: 'hvac_filter', title: 'Change HVAC Air Filters', category: 'maintenance_care', recurrence: 'monthly', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'trash_recycling', title: 'Trash / Recycling Day', category: 'utilities_household', recurrence: 'weekly', notify_day_of: true, notify_1_week: false, notify_30_days: false },
      { key: 'hvac_service', title: 'HVAC Service', category: 'maintenance_care', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'appliance_warranty', title: 'Appliance Warranty Expiration', category: 'warranties_coverage', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'insurance_renewal', title: 'Insurance Renewal Date', category: 'warranties_coverage', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'water_heater_flush', title: 'Water Heater Flush', category: 'maintenance_care', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'gutter_cleaning', title: 'Gutter Cleaning', category: 'maintenance_care', recurrence: 'semi_annual', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'smoke_detector', title: 'Replace Smoke Detector Batteries', category: 'maintenance_care', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'property_tax', title: 'Property Tax Due Date', category: 'home_property', recurrence: 'semi_annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
    ],
  },
  {
    label: 'Business Owner',
    templates: [
      { key: 'biz_license', title: 'Business License Renewal', category: 'compliance_filings', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'sales_tax', title: 'Sales Tax Filing', category: 'compliance_filings', recurrence: 'quarterly', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'biz_insurance', title: 'Business Insurance Renewal', category: 'warranties_coverage', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'equipment_service', title: 'Equipment Service Interval', category: 'equipment_assets', recurrence: 'quarterly', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'subscription_draft', title: 'Subscription Auto-Draft Confirmation', category: 'subscriptions_auto_drafts', recurrence: 'monthly', notify_day_of: true, notify_1_week: false, notify_30_days: false },
    ],
  },
  {
    label: 'Landlord',
    templates: [
      { key: 'lease_start', title: 'Lease Start Date', category: 'tenant_lifecycle', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'lease_end', title: 'Lease End Date', category: 'tenant_lifecycle', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'renewal_notice', title: 'Renewal Notice Window', category: 'tenant_lifecycle', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'move_in_inspection', title: 'Move-In Inspection', category: 'inspections_turnover', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'move_out_inspection', title: 'Move-Out Inspection', category: 'inspections_turnover', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'deposit_return', title: 'Deposit Return Deadline', category: 'rent_financial', recurrence: 'one_time', notify_day_of: true, notify_1_week: true, notify_30_days: true },
    ],
  },
  {
    label: 'Estate & Legacy',
    templates: [
      { key: 'will_review', title: 'Will / Trust Review', category: 'legal_document_reviews', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'beneficiary_review', title: 'Beneficiary Review', category: 'authorized_user_reviews', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: true },
      { key: 'emergency_contact_review', title: 'Emergency Contact Review', category: 'legacy_emergency_planning', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: false },
      { key: 'authorized_user_review', title: 'Authorized User Review', category: 'authorized_user_reviews', recurrence: 'annual', notify_day_of: true, notify_1_week: true, notify_30_days: false },
    ],
  },
];
