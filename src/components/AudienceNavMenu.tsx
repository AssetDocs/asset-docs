import React from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { audienceNavGroupLabel, audienceNavLinks } from '@/data/audienceNav';

/**
 * Desktop "Who It's For" navigation group.
 *
 * Uses the Radix NavigationMenu primitive for keyboard support, aria-expanded,
 * and escape-to-close. The content is force-mounted so all four audience links
 * exist in the hydrated DOM without opening or hovering the menu.
 */
const AudienceNavMenu: React.FC = () => (
  <NavigationMenu>
    <NavigationMenuList className="space-x-0">
      <NavigationMenuItem>
        <NavigationMenuTrigger className="h-auto bg-transparent px-0 py-0 text-base font-normal text-gray-700 hover:bg-transparent hover:text-brand-blue focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent">
          {audienceNavGroupLabel}
        </NavigationMenuTrigger>
        <NavigationMenuContent
          forceMount
          className="data-[state=closed]:hidden md:!left-auto"
        >
          <ul className="w-56 p-2">
            {audienceNavLinks.map((link) => (
              <li key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    to={link.href}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

export default AudienceNavMenu;
