import type { AssetUploadType } from '@/components/AssetTypeSelector';

/**
 * Single source of truth for where each Asset Documentation upload type goes.
 * Consumed by the Asset Documentation upload button and the dashboard Quick Add
 * shortcut so the two entry points cannot drift.
 */
export type AssetUploadDestination =
  | { kind: 'scan' }
  | { kind: 'route'; to: string };

export function resolveAssetUploadDestination(type: AssetUploadType): AssetUploadDestination {
  switch (type) {
    case 'scan_to_pdf':
      return { kind: 'scan' };
    case 'photo':
      return { kind: 'route', to: '/account/media/upload?tab=photos' };
    case 'video':
      return { kind: 'route', to: '/account/media/upload?tab=videos' };
    case 'insurance_policy':
      return { kind: 'route', to: '/account/insurance/new' };
    case 'manual_entry':
      // Existing Manual Entry screen — unchanged behavior, new parent section.
      return { kind: 'route', to: '/inventory' };
    default:
      return { kind: 'route', to: `/account/documents/upload?type=${type}` };
  }
}
