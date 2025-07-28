import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FeaturedGuideShortcut: React.FC = () => {
  return (
    <Card className="border-2 border-brand-blue/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
      <CardContent className="p-8 h-full">
        <div className="flex items-start gap-6 h-full">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-orange rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-brand-orange fill-current" />
              <span className="text-sm font-semibold text-brand-orange uppercase tracking-wide">
                Featured Guide
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Digital Documentation Advantage
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed flex-1">
              Discover how modern digital documentation transforms asset management, 
              providing accuracy, accessibility, and peace of mind that traditional 
              methods simply can't match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                className="bg-gradient-to-r from-brand-blue to-brand-blue/90 hover:from-brand-blue/90 hover:to-brand-blue text-white font-semibold"
              >
                <Link to="/press-news/digital-documentation-guide" className="flex items-center gap-2">
                  <span>Read the Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                <Link to="/features">
                  See How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-brand-orange/10 to-brand-blue/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 rounded-full blur-xl"></div>
      </CardContent>
    </Card>
  );
};

export default FeaturedGuideShortcut;