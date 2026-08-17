/**
 * Canonical navigation map for the account dashboard tabs.
 *
 * This is the ONE place where legacy tab keys are normalized and where each
 * module's parent (Knowledge Hub or one of its wrapper screens) is declared.
 * No component should sprinkle its own redirect logic.
 */

export const KNOWLEDGE_HUB_TAB = 'knowledge-hub';

/** Old tab keys kept alive for bookmarks and already-persisted resume routes. */
export const LEGACY_ACCOUNT_TAB_ALIASES: Record<string, string> = {
  'life-hub': KNOWLEDGE_HUB_TAB,
  'insights-tools': KNOWLEDGE_HUB_TAB,
  // Quick Notes was retired and folded into the main Notes module.
  'quick-notes': 'notes',
};

export function normalizeAccountTab(tab: string | null | undefined): string {
  if (!tab) return 'overview';
  return LEGACY_ACCOUNT_TAB_ALIASES[tab] ?? tab;
}

export function isLegacyAccountTab(tab: string | null | undefined): boolean {
  return Boolean(tab && tab in LEGACY_ACCOUNT_TAB_ALIASES);
}

/** Wrapper screens: navigation only, no data fetching or mutations. */
export const KNOWLEDGE_HUB_WRAPPER_TABS = ['contacts', 'notes-hub', 'traditions-recipes'] as const;

/** Where each tab's contextual "Back to …" button should go. */
export const ACCOUNT_TAB_PARENT: Record<string, string> = {
  // Wrappers sit directly under the hub
  'contacts': KNOWLEDGE_HUB_TAB,
  'notes-hub': KNOWLEDGE_HUB_TAB,
  'traditions-recipes': KNOWLEDGE_HUB_TAB,
  // People & Care
  'service-pros': 'contacts',
  'medication-list': KNOWLEDGE_HUB_TAB,
  // Notes & Family
  'notes': 'notes-hub',
  'voice-notes': 'notes-hub',
  'family-traditions': 'traditions-recipes',
  'family-recipes': 'traditions-recipes',
  'memory-safe': KNOWLEDGE_HUB_TAB,
  // Property & Household
  'important-locations': KNOWLEDGE_HUB_TAB,
  'paint-codes': KNOWLEDGE_HUB_TAB,
  'upgrades-repairs': KNOWLEDGE_HUB_TAB,
  'source-websites': KNOWLEDGE_HUB_TAB,
  // Planning
  'smart-calendar': KNOWLEDGE_HUB_TAB,
};

/** Labels used by the contextual back button. */
export const ACCOUNT_TAB_LABELS: Record<string, string> = {
  [KNOWLEDGE_HUB_TAB]: 'Knowledge Hub',
  'contacts': 'Contacts',
  'notes-hub': 'Notes',
  'traditions-recipes': 'Family Traditions & Recipes',
};

export function getAccountTabParent(tab: string): { tab: string; label: string } | null {
  const parent = ACCOUNT_TAB_PARENT[tab];
  if (!parent) return null;
  return { tab: parent, label: ACCOUNT_TAB_LABELS[parent] ?? 'Knowledge Hub' };
}

export function accountTabRoute(tab: string): string {
  return tab === 'overview' ? '/account' : `/account?tab=${encodeURIComponent(tab)}`;
}
