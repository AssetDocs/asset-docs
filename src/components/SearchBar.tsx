import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Camera, Video, Home, LayoutDashboard, HelpCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchService, SearchResult, QuickAction } from '@/services/SearchService';
import { useAuth } from '@/contexts/AuthContext';

interface SearchBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ isExpanded, onToggle, onClose, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = SearchService.search(searchQuery, 6);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(isExpanded);
    }
  }, [searchQuery, isExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      navigate(searchResults[0].path);
      handleClose();
    }
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleQuickActionClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      Camera,
      Video,
      Home,
      LayoutDashboard,
      HelpCircle,
      Clock,
      TrendingUp
    };
    return icons[iconName] || Home;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'account': return LayoutDashboard;
      case 'help': return HelpCircle;
      case 'feature': return TrendingUp;
      default: return Home;
    }
  };

  const quickActions = SearchService.getQuickActions().filter(action => {
    // Filter quick actions based on authentication status
    if (!isAuthenticated && action.path.startsWith('/account')) {
      return false;
    }
    return true;
  });

  const popularSearches = SearchService.getPopularSearches();

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`p-2 text-gray-700 hover:text-brand-blue hover:bg-brand-blue/10 ${className}`}
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search pages, features, help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-64 pr-8 border-brand-blue/30 focus:border-brand-blue"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-1 p-1 h-6 w-6 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Search Results
              </div>
              {searchResults.map((result) => {
                const CategoryIcon = getCategoryIcon(result.category);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <CategoryIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{result.title}</div>
                      <div className="text-sm text-gray-500 truncate">{result.description}</div>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{result.category}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions (when no search query) */}
          {!searchQuery.trim() && quickActions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Quick Actions
              </div>
              {quickActions.slice(0, 4).map((action) => {
                const ActionIcon = getIcon(action.icon);
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickActionClick(action.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <ActionIcon className="h-4 w-4 text-brand-blue flex-shrink-0" />
                    <span className="font-medium text-gray-900">{action.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Popular Searches (when no search query) */}
          {!searchQuery.trim() && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                {popularSearches.slice(0, 4).map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim() && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <div className="font-medium">No results found</div>
              <div className="text-sm">Try different keywords or check spelling</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;