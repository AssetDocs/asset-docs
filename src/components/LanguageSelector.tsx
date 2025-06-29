
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation, languages } from '@/contexts/TranslationContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = (language: typeof languages[0]) => {
    changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe size={16} />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-brand-blue">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
