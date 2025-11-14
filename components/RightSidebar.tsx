import React from 'react';
import type { Language } from '../types.ts';
import { LANGUAGES, LanguageIcon } from '../constants.tsx';
import type { TranslationKey } from '../translations.ts';

interface RightSidebarProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedLanguage, onSelectLanguage, t }) => {
  return (
    <aside className="w-48 p-4 hidden lg:block">
      <div className="h-full glass-container p-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 text-gray-400">
          <LanguageIcon />
          <h2 className="text-sm font-semibold tracking-widest">{t('language')}</h2>
        </div>
        <div className="flex flex-col space-y-2 w-full">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang)}
              className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform ${
                selectedLanguage.code === lang.code
                  ? 'btn-primary text-white'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;