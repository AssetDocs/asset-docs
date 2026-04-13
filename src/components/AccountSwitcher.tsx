import React from 'react';
import { useAccount } from '@/contexts/AccountContext';
import { ChevronDown, Shield, Eye, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const roleBadge = (role: string | null) => {
  switch (role) {
    case 'owner':
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-2 bg-accent text-accent-foreground"><Crown className="h-2.5 w-2.5 mr-0.5 inline" />Owner</Badge>;
    case 'full_access':
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-2 bg-primary/10 text-primary"><Shield className="h-2.5 w-2.5 mr-0.5 inline" />Full Access</Badge>;
    case 'read_only':
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-2 bg-muted text-muted-foreground"><Eye className="h-2.5 w-2.5 mr-0.5 inline" />Read Only</Badge>;
    default:
      return null;
  }
};

const AccountSwitcher: React.FC = () => {
  const { accountId, accountName, accounts, hasMultipleAccounts, switchAccount } = useAccount();

  if (!hasMultipleAccounts) return null;

  const ownedAccounts = accounts.filter(a => a.role === 'owner');
  const sharedAccounts = accounts.filter(a => a.role !== 'owner');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors max-w-[200px]">
        <span className="truncate">{accountName || 'Select Account'}</span>
        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        {ownedAccounts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Owned by You</DropdownMenuLabel>
            {ownedAccounts.map(a => (
              <DropdownMenuItem
                key={a.accountId}
                onClick={() => switchAccount(a.accountId)}
                className={`cursor-pointer ${a.accountId === accountId ? 'bg-accent' : ''}`}
              >
                <span className="truncate flex-1 text-sm">{a.accountName}</span>
                {roleBadge(a.role)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        {ownedAccounts.length > 0 && sharedAccounts.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {sharedAccounts.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Shared With You</DropdownMenuLabel>
            {sharedAccounts.map(a => (
              <DropdownMenuItem
                key={a.accountId}
                onClick={() => switchAccount(a.accountId)}
                className={`cursor-pointer ${a.accountId === accountId ? 'bg-accent' : ''}`}
              >
                <span className="truncate flex-1 text-sm">{a.accountName}</span>
                {roleBadge(a.role)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSwitcher;
