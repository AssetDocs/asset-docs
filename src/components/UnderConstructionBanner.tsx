import React from 'react';
import { Construction } from 'lucide-react';

const UnderConstructionBanner: React.FC = () => {
  return (
    <div className="sticky top-0 z-50 bg-yellow-400 text-black px-4 py-2 shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Construction className="h-4 w-4" />
        <span>This site is currently under construction. Some features may be limited.</span>
      </div>
    </div>
  );
};

export default UnderConstructionBanner;
