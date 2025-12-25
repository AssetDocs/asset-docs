import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SocialImpactShortcut: React.FC = () => {
  return (
    <Card className="border-2 border-brand-orange/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
      <CardContent className="p-8 h-full">
        <div className="flex items-start gap-6 h-full">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-blue rounded-xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-brand-blue fill-current" />
              <span className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                Social Impact
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Making Protection Accessible
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed flex-1">
              Learn how we're helping families, small businesses, and communities 
              prepare for the unexpected and recover faster when life happens.
            </p>
            
            <Button 
              asChild 
              className="bg-gradient-to-r from-brand-orange to-brand-orange/90 hover:from-brand-orange/90 hover:to-brand-orange text-white font-semibold"
            >
              <Link to="/social-impact" className="flex items-center gap-2">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-brand-orange/10 to-brand-blue/10 rounded-full blur-xl"></div>
      </CardContent>
    </Card>
  );
};

export default SocialImpactShortcut;