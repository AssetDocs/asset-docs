/**
 * Rebuild-mode public gate.
 *
 * PURPOSE: temporarily reduce the PUBLIC attack surface while Asset Safe
 * undergoes architectural and security work. The full application is served
 * only on an explicit, narrow allow-list of private development hostnames.
 *
 * THIS IS NOT A SECURITY CONTROL AND IS NOT AUTHORIZATION REMEDIATION.
 * It does not fix, replace, or certify route-level authentication or
 * authorization. Known findings on internal/admin routes remain open items to
 * be remediated separately.
 *
 * FAIL CLOSED: any hostname that is not an exact match in the allow-list below
 * — known public domain, unknown domain, new domain, IP address, anything —
 * renders the temporary landing experience. No wildcard matching, no substring
 * matching, no "contains preview", no "any lovable.app".
 *
 * TO RESTORE THE FULL PUBLIC SITE LATER: set REBUILD_MODE to false.
 */

/** Master switch for the temporary landing experience. */
export const REBUILD_MODE = true;

/**
 * The ONLY hostnames permitted to render the complete application.
 * Exact string matches. Add nothing here that is publicly reachable.
 */
const PRIVATE_APP_HOSTS: readonly string[] = [
  // Private Lovable editor preview for this project (requires a Lovable
  // account with access to the project before the app is even served).
  'id-preview--6cc71ded-5ae5-4631-b400-4bb41f9ebfd3.lovable.app',
  // Local development only.
  'localhost',
  '127.0.0.1',
  '[::1]',
];

/**
 * Known public hostnames. Listed for documentation and auditability only —
 * the gate does not depend on this list, because anything absent from
 * PRIVATE_APP_HOSTS is already treated as public.
 */
export const KNOWN_PUBLIC_HOSTS: readonly string[] = [
  'getassetsafe.com',
  'www.getassetsafe.com',
  'assetsafe.net',
  'www.assetsafe.net',
  'assetsafenet.lovable.app',
];

/** True when the current hostname is an exact allow-listed private app host. */
export const isPrivateAppHost = (): boolean => {
  if (typeof window === 'undefined') return false; // no window -> fail closed
  const host = window.location.hostname.toLowerCase();
  return PRIVATE_APP_HOSTS.includes(host);
};

/**
 * True when the visitor should see ONLY the temporary landing experience.
 * Defaults to true whenever the host is not explicitly allow-listed.
 */
export const isRebuildModeActive = (): boolean =>
  REBUILD_MODE && !isPrivateAppHost();
