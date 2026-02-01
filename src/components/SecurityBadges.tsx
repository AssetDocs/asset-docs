import React from 'react';
import { Shield, Lock, CheckCircle, Server, CreditCard, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityBadgesProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const badges = [
  {
    icon: Lock,
    title: '256-bit AES',
    subtitle: 'Encryption',
    description: 'Bank-level encryption protects your data at rest and in transit'
  },
  {
    icon: Shield,
    title: 'SOC 2',
    subtitle: 'Compliant',
    description: 'Enterprise-grade security controls and regular audits'
  },
  {
    icon: Server,
    title: 'AWS',
    subtitle: 'Hosted',
    description: 'Secure cloud infrastructure with 99.9% uptime'
  },
  {
    icon: Globe,
    title: 'GDPR',
    subtitle: 'Ready',
    description: 'Full compliance with international data protection'
  },
  {
    icon: CreditCard,
    title: 'Stripe',
    subtitle: 'Secured',
    description: 'PCI-compliant payment processing - we never see your card'
  },
  {
    icon: CheckCircle,
    title: 'HTTPS',
    subtitle: 'Everywhere',
    description: 'All connections encrypted with TLS 1.3'
  }
];

const SecurityBadges: React.FC<SecurityBadgesProps> = ({ variant = 'default', className }) => {
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm"
          >
            <badge.icon className="w-4 h-4 text-brand-green" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">{badge.title}</span>
              <span className="text-muted-foreground ml-1">{badge.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="group flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border hover:border-brand-green/50 hover:shadow-md transition-all duration-200"
          >
            <div className="p-3 rounded-full bg-brand-green/10 text-brand-green mb-3 group-hover:bg-brand-green/20 transition-colors">
              <badge.icon className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-foreground">{badge.title}</div>
            <div className="text-xs text-muted-foreground">{badge.subtitle}</div>
            <p className="text-xs text-muted-foreground mt-2 hidden md:block">{badge.description}</p>
          </div>
        ))}
      </div>
    );
  }

  // Default variant - horizontal badge strip
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3 md:gap-6", className)}>
      {badges.slice(0, 4).map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-2 group"
          title={badge.description}
        >
          <div className="p-1.5 rounded-md bg-brand-green/10 text-brand-green group-hover:bg-brand-green/20 transition-colors">
            <badge.icon className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground">{badge.title}</span>
            <span className="text-muted-foreground ml-1 hidden sm:inline">{badge.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;
