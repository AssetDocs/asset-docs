
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Video } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { translate } = useTranslation();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b60286e3-ddd8-48f4-9a60-56cfa470be11.png" 
              alt="Asset Docs Logo" 
              className="h-20 mr-2"
            />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-gray-700 hover:text-brand-blue transition-colors">
              {translate('nav.features')}
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-brand-blue transition-colors">
              {translate('nav.pricing')}
            </Link>
            <Link 
              to="/video-help" 
              className="text-gray-700 hover:text-brand-blue transition-colors flex items-center"
            >
              <Video className="h-4 w-4 mr-1" />
              {translate('nav.videoHelp')}
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-brand-blue transition-colors">
              {translate('nav.login')}
            </Link>
            <LanguageSelector />
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/signup">{translate('nav.startTrial')}</Link>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
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
                {translate('nav.features')}
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('nav.pricing')}
              </Link>
              <Link 
                to="/video-help" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Video className="h-4 w-4 mr-1" />
                {translate('nav.videoHelp')}
              </Link>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-brand-blue transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('nav.login')}
              </Link>
              <Button 
                asChild 
                className="bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/signup">{translate('nav.startTrial')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
