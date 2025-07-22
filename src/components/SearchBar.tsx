import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ isExpanded, onToggle, onClose, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      // For now, we'll navigate to press-news with search query
      navigate(`/press-news?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      setSearchQuery('');
    }
  };

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
    <form onSubmit={handleSearch} className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-64 pr-8 border-brand-blue/30 focus:border-brand-blue"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-1 p-1 h-6 w-6 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;