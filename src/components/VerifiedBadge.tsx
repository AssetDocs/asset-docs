import React from 'react';
import { BadgeCheck, ShieldPlus } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  isVerified: boolean;
  isVerifiedPlus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  isVerified, 
  isVerifiedPlus = false,
  size = 'md',
  showLabel = false,
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

  // Show nothing if not verified at all
  if (!isVerified) {
    return null;
  }

  // Verified+ badge (yellow)
  if (isVerifiedPlus) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('inline-flex items-center gap-1', className)}>
              <ShieldPlus 
                className={cn(
                  sizeClasses[size], 
                  'text-yellow-500 fill-yellow-100'
                )} 
              />
              {showLabel && (
                <span className={cn(labelSizeClasses[size], 'text-yellow-600 font-medium')}>
                  Verified+
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <ShieldPlus className="h-4 w-4 text-yellow-500" />
              <span>Verified+ Account (2FA Protected)</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Standard Verified badge (green)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1', className)}>
            <BadgeCheck 
              className={cn(
                sizeClasses[size], 
                'text-green-500 fill-green-100'
              )} 
            />
            {showLabel && (
              <span className={cn(labelSizeClasses[size], 'text-green-600 font-medium')}>
                Verified
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Verified Asset Safe Account</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
