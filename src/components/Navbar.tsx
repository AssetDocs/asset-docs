
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c2744c0b-391a-44b1-9133-004db899c866.png" 
              alt="AssetDocs Logo" 
              className="h-16 mr-2" // Increased from h-10 to h-16
            />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-gray-700 hover:text-brand-blue transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-brand-blue transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-brand-blue transition-colors">
              Login
            </Link>
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/features" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Button 
                asChild 
                className="bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
