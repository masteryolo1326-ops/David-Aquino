import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '../types.ts';
import { LANGUAGES, LanguageIcon, LogoIcon } from '../constants.tsx';
import type { TranslationKey } from '../translations.ts';

interface TopBarProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const TopBar: React.FC<TopBarProps> = ({ selectedLanguage, onSelectLanguage, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-16 px-6 z-20 flex justify-between items-center glass-container">
      <div className="flex items-center space-x-3">
        <LogoIcon />
        <h1 className="text-xl font-bold font-display text-white">{t('votingSys')}</h1>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <LanguageIcon />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-slate-800/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg overflow-hidden animate-fade-in-scale-up origin-top-right">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${selectedLanguage.code === lang.code ? 'text-yellow-400' : 'text-white'} hover:bg-white/10 transition-colors`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;