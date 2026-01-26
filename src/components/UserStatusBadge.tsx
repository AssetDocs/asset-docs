import React from 'react';
import { Shield, ShieldCheck, ShieldPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface UserStatusBadgeProps {
  status: 'User' | 'Verified' | 'Verified+';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showLabel = true,
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const paddingClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'Verified+':
        return {
          Icon: ShieldPlus,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          tooltip: 'Verified+ Account (2FA Protected)'
        };
      case 'Verified':
        return {
          Icon: ShieldCheck,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          tooltip: 'Verified Account'
        };
      default:
        return {
          Icon: Shield,
          iconColor: 'text-slate-400',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200',
          tooltip: 'Standard User Account'
        };
    }
  };

  const config = getStatusConfig();
  const { Icon } = config;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'inline-flex items-center gap-1 rounded-full border',
            config.bgColor,
            config.borderColor,
            paddingClasses[size],
            className
          )}>
            <Icon className={cn(sizeClasses[size], config.iconColor)} />
            {showLabel && (
              <span className={cn(labelSizeClasses[size], config.textColor, 'font-medium')}>
                {status}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', config.iconColor)} />
            <span>{config.tooltip}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserStatusBadge;
