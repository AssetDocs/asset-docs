/**
 * Shared "Who It's For" audience navigation links.
 *
 * Single source of truth consumed by both the Navbar and the Footer.
 * Labels are audience self-identification labels and intentionally differ
 * from each page's title/H1 (which carry the keyword phrasing).
 *
 * Do not duplicate these links inline anywhere else.
 */

export interface AudienceNavLink {
  label: string;
  href: string;
}

export const audienceNavGroupLabel = "Who It's For";

export const audienceNavLinks: AudienceNavLink[] = [
  { label: 'Homeowners', href: '/home-inventory' },
  { label: 'Renters', href: '/renters' },
  { label: 'Landlords', href: '/landlords' },
  { label: 'Small Business', href: '/small-business' },
];
