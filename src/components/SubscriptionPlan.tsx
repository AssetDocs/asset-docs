
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface SubscriptionPlanProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  buttonText?: string;
  onClick?: () => void;
  buttonClassName?: string;
  billingInterval?: 'month' | 'year';
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  description,
  features,
  recommended = false,
  buttonText = "Subscribe",
  onClick,
  buttonClassName,
  billingInterval = 'month'
}) => {
  return (
    <Card className={`flex flex-col h-full ${recommended ? 'border-2 border-brand-orange relative' : ''}`}>
      {recommended && (
        <div className="absolute top-0 right-0 bg-brand-orange text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
          Recommended
        </div>
      )}
      <CardHeader className="pb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Custom' && !price.includes('year') && (
            <span className="text-gray-600 ml-2">/{billingInterval === 'year' ? 'year' : 'month'}</span>
          )}
          {price !== 'Custom' && (
            <span className="text-xs text-muted-foreground ml-1">+ tax</span>
          )}
        </div>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-brand-orange flex-shrink-0 mr-2" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          className={buttonClassName || `w-full ${recommended ? 'bg-brand-orange hover:bg-brand-orange/90' : 'bg-brand-blue hover:bg-brand-lightBlue'}`} 
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPlan;
