import { supabase } from '@/integrations/supabase/client';

export type DashboardResumeActivityType =
  | 'property_created'
  | 'property_opened'
  | 'photos_uploaded'
  | 'videos_uploaded'
  | 'documents_uploaded'
  | 'asset_documentation_opened'
  | 'insights_tools_opened'
  | 'family_archive_opened'
  | 'vip_contacts_opened'
  | 'emergency_instructions_opened'
  | 'legacy_locker_opened'
  | 'digital_access_opened'
  | 'authorized_users_opened'
  | 'legacy_admin_opened'
  | 'mfa_opened'
  | 'mfa_enabled'
  | 'security_progress_next_step_opened'
  | 'documentation_checklist_opened';

export type DashboardResumeActivityInput = {
  accountId: string | null;
  isOwner: boolean;
  activityType: DashboardResumeActivityType;
  activityLabel: string;
  destinationRoute: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

const GENERIC_VAULT_LABELS: Partial<Record<DashboardResumeActivityType, string>> = {
  legacy_locker_opened: 'Complete Legacy Locker details',
  digital_access_opened: 'Open Digital Access',
};

export async function recordDashboardResumeActivity(input: DashboardResumeActivityInput): Promise<void> {
  if (!input.accountId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const safeLabel = (GENERIC_VAULT_LABELS[input.activityType] || input.activityLabel).trim().slice(0, 120);
  const safeRoute = input.destinationRoute.trim().slice(0, 300);
  if (!safeLabel || !safeRoute) return;

  try {
    await (supabase as any).from('dashboard_resume_activities').insert({
      user_id: user.id,
      account_id: input.accountId,
      workspace_context: input.isOwner ? 'owned' : 'shared',
      activity_type: input.activityType,
      activity_label: safeLabel,
      destination_route: safeRoute,
      related_entity_type: input.relatedEntityType || null,
      related_entity_id: input.relatedEntityId || null,
    });
  } catch (error) {
    console.error('Failed to record dashboard resume activity:', error);
  }
}

export const dashboardResumeRoutes = {
  assetDocumentation: '/account?tab=asset-documentation',
  familyArchive: '/account?tab=life-hub',
  authorizedUsers: '/account?tab=access-activity',
  legacyAdmin: '/account?tab=access-activity',
  legacyLocker: '/account?tab=legacy-locker',
  digitalAccess: '/account?tab=password-catalog',
  emergencyInstructions: '/account?tab=emergency-instructions',
  documentationChecklist: '/account#documentation-checklist',
  mfa: '/account/settings?tab=security',
};
