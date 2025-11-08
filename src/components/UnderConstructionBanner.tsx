import React from 'react';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnderConstructionBanner: React.FC = () => {
  return (
    <div className="sticky top-0 z-50 bg-yellow-400 text-black px-4 py-2 shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Construction className="h-4 w-4 flex-shrink-0" />
        <span>
          This site is currently under construction. Feel free to browse around and learn more about AssetDocs! 
          {" "}Have questions? {" "}
          <Link to="/contact" className="underline hover:text-gray-700 font-semibold">
            Contact us
          </Link>
        </span>
      </div>
    </div>
  );
};

export default UnderConstructionBanner;
