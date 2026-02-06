import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CardColor = 'blue' | 'green' | 'amber' | 'yellow' | 'purple' | 'rose' | 'teal' | 'orange';

interface DashboardGridCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string[];
  actionLabel: string;
  actionIcon?: React.ReactNode;
  onClick: () => void;
  color: CardColor;
  variant?: 'default' | 'compact';
}

const colorMap: Record<CardColor, {
  border: string;
  iconBg: string;
  iconText: string;
  btnBorder: string;
  btnText: string;
  btnHover: string;
}> = {
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    btnBorder: 'border-blue-200',
    btnText: 'text-blue-700',
    btnHover: 'hover:bg-blue-50',
  },
  green: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    btnBorder: 'border-emerald-200',
    btnText: 'text-emerald-700',
    btnHover: 'hover:bg-emerald-50',
  },
  teal: {
    border: 'border-l-teal-500',
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
    btnBorder: 'border-teal-200',
    btnText: 'text-teal-700',
    btnHover: 'hover:bg-teal-50',
  },
  amber: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    btnBorder: 'border-amber-200',
    btnText: 'text-amber-700',
    btnHover: 'hover:bg-amber-50',
  },
  yellow: {
    border: 'border-l-yellow-500',
    iconBg: 'bg-yellow-50',
    iconText: 'text-yellow-600',
    btnBorder: 'border-yellow-200',
    btnText: 'text-yellow-700',
    btnHover: 'hover:bg-yellow-50',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    btnBorder: 'border-purple-200',
    btnText: 'text-purple-700',
    btnHover: 'hover:bg-purple-50',
  },
  rose: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    btnBorder: 'border-rose-200',
    btnText: 'text-rose-700',
    btnHover: 'hover:bg-rose-50',
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    btnBorder: 'border-orange-200',
    btnText: 'text-orange-700',
    btnHover: 'hover:bg-orange-50',
  },
};

export const DashboardGridCard: React.FC<DashboardGridCardProps> = ({
  icon,
  title,
  description,
  tags,
  actionLabel,
  actionIcon,
  onClick,
  color,
  variant = 'default',
}) => {
  const colors = colorMap[color];

  return (
    <Card
      className={cn(
        'border-l-4 hover:shadow-lg transition-all cursor-pointer group bg-white',
        colors.border,
      )}
      onClick={onClick}
    >
      <CardContent className={cn('pt-6', variant === 'compact' && 'pt-4 pb-4')}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex items-center justify-center rounded-xl flex-shrink-0',
              colors.iconBg,
              variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12'
            )}
          >
            <div className={colors.iconText}>{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-bold text-foreground',
                variant === 'compact' ? 'text-sm' : 'text-lg'
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                'text-muted-foreground mt-1',
                variant === 'compact' ? 'text-xs line-clamp-2' : 'text-sm'
              )}
            >
              {description}
            </p>
            {tags && tags.length > 0 && (
              <p
                className={cn(
                  'mt-2 font-medium',
                  variant === 'compact' ? 'text-xs text-muted-foreground' : 'text-xs text-muted-foreground'
                )}
              >
                {tags.join(' · ')}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          className={cn(
            'w-full mt-4 font-medium',
            colors.btnBorder,
            colors.btnText,
            colors.btnHover,
            variant === 'compact' && 'mt-3 h-8 text-xs'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {actionIcon && <span className="mr-2">{actionIcon}</span>}
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardGridCard;
