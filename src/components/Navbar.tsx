import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Video, LogOut, User, Home } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import assetSafeLogo from '@/assets/asset-safe-logo.png';

import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { translate } = useTranslation();
  const { isAuthenticated, signOut, profile } = useAuth();

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={assetSafeLogo} 
              alt="Asset Safe - Digital Home Inventory and Legacy Locker Platform" 
              className="h-24 mr-2"
              width="auto"
              height="96"
            />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchBar
              isExpanded={isSearchExpanded}
              onToggle={handleSearchToggle}
              onClose={handleSearchClose}
            />
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                 <NavLink 
                   to="/account" 
                   className={({ isActive }) => 
                     `flex items-center px-3 py-2 transition-all rounded-md font-medium ${isActive ? 'bg-brand-orange text-white' : 'bg-brand-orange/90 text-white hover:bg-brand-orange'}`
                   }
                 >
                   <Home className="h-4 w-4 mr-1" />
                   {translate('nav.dashboard')}
                 </NavLink>
                 <NavLink 
                   to="/features" 
                   className={({ isActive }) => 
                     `text-gray-700 hover:text-brand-blue transition-colors ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                   }
                 >
                   {translate('nav.features')}
                 </NavLink>
                 <NavLink 
                   to="/pricing" 
                   className={({ isActive }) => 
                     `text-gray-700 hover:text-brand-blue transition-colors ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                   }
                 >
                   {translate('nav.pricing')}
                 </NavLink>
                 <NavLink 
                   to="/gift" 
                   className={({ isActive }) => 
                     `text-gray-700 hover:text-brand-blue transition-colors ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                   }
                 >
                   Gift
                 </NavLink>
                 <NavLink 
                   to="/blog" 
                   className={({ isActive }) => 
                     `text-gray-700 hover:text-brand-blue transition-colors ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                   }
                 >
                   Blog
                 </NavLink>
                <NavLink 
                  to="/video-help" 
                  className={({ isActive }) => 
                    `text-gray-700 hover:text-brand-blue transition-colors flex items-center ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                  }
                >
                  <Video className="h-4 w-4 mr-1" />
                  {translate('nav.videoHelp')}
                </NavLink>
                 <div className="flex items-center space-x-4">
                   <Link 
                     to="/account" 
                     className="flex items-center text-gray-700 hover:text-brand-blue transition-colors"
                   >
                     <User className="h-4 w-4 mr-1" />
                      {profile?.first_name || translate('nav.account')}
                   </Link>
                   <Button
                     onClick={signOut}
                     variant="outline"
                     size="sm"
                     className="text-gray-700 hover:text-red-600"
                   >
                     <LogOut className="h-4 w-4 mr-1" />
                      {translate('nav.signOut')}
                   </Button>
                 </div>
              </>
            ) : (
              <>
                   <Link to="/features" className="text-gray-700 hover:text-brand-blue transition-colors">
                     {translate('nav.features')}
                   </Link>
                   <Link to="/pricing" className="text-gray-700 hover:text-brand-blue transition-colors">
                     {translate('nav.pricing')}
                   </Link>
                   <Link to="/gift" className="text-gray-700 hover:text-brand-blue transition-colors">
                     Gift
                   </Link>
                   <Link to="/blog" className="text-gray-700 hover:text-brand-blue transition-colors">
                     Blog
                   </Link>
                <Link 
                  to="/video-help" 
                  className="text-gray-700 hover:text-brand-blue transition-colors flex items-center"
                >
                  <Video className="h-4 w-4 mr-1" />
                  {translate('nav.videoHelp')}
                </Link>
                 <Button asChild variant="outline">
                   <Link 
                     to="/login" 
                     className="px-3 py-2 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors rounded-md"
                   >
                     {translate('nav.login')}
                   </Link>
                 </Button>
                   <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
                      <Link to="/signup">{translate('nav.getStarted')}</Link>
                   </Button>
              </>
            )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <SearchBar
              isExpanded={isSearchExpanded}
              onToggle={handleSearchToggle}
              onClose={handleSearchClose}
              className="mr-2"
            />
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
              {isAuthenticated ? (
                <>
                   <NavLink 
                     to="/account" 
                     className={({ isActive }) => 
                       `flex items-center px-3 py-2 transition-all rounded-md font-medium w-fit ${isActive ? 'bg-brand-orange text-white' : 'bg-brand-orange/90 text-white hover:bg-brand-orange'}`
                     }
                     onClick={() => setIsMenuOpen(false)}
                   >
                     <Home className="h-4 w-4 mr-1" />
                     {translate('nav.dashboard')}
                   </NavLink>
                   <NavLink 
                     to="/features" 
                     className={({ isActive }) => 
                       `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                     }
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {translate('nav.features')}
                   </NavLink>
                   <NavLink 
                     to="/pricing" 
                     className={({ isActive }) => 
                       `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                     }
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {translate('nav.pricing')}
                   </NavLink>
                    <NavLink 
                      to="/gift" 
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gift
                    </NavLink>
                    <NavLink 
                      to="/blog" 
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Blog
                    </NavLink>
                   <NavLink 
                    to="/video-help" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-brand-blue transition-colors py-2 flex items-center ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    {translate('nav.videoHelp')}
                  </NavLink>
                   <Link 
                     to="/account" 
                     className="text-gray-700 hover:text-brand-blue transition-colors py-2 flex items-center"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     <User className="h-4 w-4 mr-1" />
                     {profile?.first_name || translate('nav.account')}
                   </Link>
                   <Button
                     onClick={() => {
                       signOut();
                       setIsMenuOpen(false);
                     }}
                     variant="outline"
                     size="sm"
                     className="text-gray-700 hover:text-red-600 w-fit"
                   >
                     <LogOut className="h-4 w-4 mr-1" />
                     {translate('nav.signOut')}
                   </Button>
                </>
               ) : (
                <>
                   <NavLink 
                      to="/features" 
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translate('nav.features')}
                    </NavLink>
                   <NavLink 
                      to="/pricing" 
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translate('nav.pricing')}
                    </NavLink>
                    <NavLink 
                      to="/gift"
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gift
                    </NavLink>
                    <NavLink 
                      to="/blog" 
                      className={({ isActive }) => 
                        `text-gray-700 hover:text-brand-blue transition-colors py-2 ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Blog
                    </NavLink>
                   <NavLink 
                    to="/video-help" 
                    className={({ isActive }) => 
                      `text-gray-700 hover:text-brand-blue transition-colors py-2 flex items-center ${isActive ? 'bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-medium' : ''}`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    {translate('nav.videoHelp')}
                  </NavLink>
                   <Button asChild variant="outline" className="w-fit">
                     <Link 
                       to="/login" 
                       className="px-3 py-2 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors rounded-md inline-block"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       {translate('nav.login')}
                     </Link>
                   </Button>
                     <Button 
                       asChild 
                       className="bg-brand-orange hover:bg-brand-orange/90 w-fit"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       <Link to="/signup">{translate('nav.getStarted')}</Link>
                     </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
