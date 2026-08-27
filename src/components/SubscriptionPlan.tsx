
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface FeatureGroup {
  title: string;
  items: string[];
}

interface SubscriptionPlanProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  featureGroups?: FeatureGroup[];
  featuresLead?: string;
  recommended?: boolean;
  buttonText?: string;
  onClick?: () => void;
  buttonClassName?: string;
  billingInterval?: 'month' | 'year';
  footer?: React.ReactNode;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  description,
  features,
  featureGroups,
  featuresLead,
  recommended = false,
  buttonText = "Subscribe",
  onClick,
  buttonClassName,
  billingInterval = 'month',
  footer
}) => {
  return (
    <Card className={`flex flex-col h-full ${recommended ? 'border-2 border-brand-orange relative' : ''}`}>
      <CardHeader className="pb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Custom' && !price.includes('year') && (
            <span className="text-muted-foreground ml-2">/{billingInterval === 'year' ? 'year' : 'month'}</span>
          )}
          {price !== 'Custom' && (
            <span className="text-xs text-muted-foreground ml-1">+ tax</span>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        {featuresLead && (
          <p className="text-sm font-medium text-foreground mb-5">{featuresLead}</p>
        )}
        {featureGroups && featureGroups.length > 0 ? (
          <div className="space-y-5">
            {featureGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-foreground tracking-wide mb-1.5">
                  {group.title}
                </h4>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-brand-orange flex-shrink-0 mr-2 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-5 w-5 text-brand-orange flex-shrink-0 mr-2" />
                <span className="text-muted-foreground whitespace-pre-line">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="pt-4 flex-col items-stretch gap-0">
        {footer ? footer : (
          <Button
            className={buttonClassName || `w-full ${recommended ? 'bg-brand-orange hover:bg-brand-orange/90' : 'bg-brand-blue hover:bg-brand-lightBlue'}`}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlan;
