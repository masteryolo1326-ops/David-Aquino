import React from 'react';
import LeftSidebar from './LeftSidebar.tsx';
import RightSidebar from './RightSidebar.tsx';
import TopBar from './TopBar.tsx';
import BottomNavBar from './BottomNavBar.tsx';
import type { Page, Language } from '../types.ts';
import type { TranslationKey } from '../translations.ts';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  navigateTo: (page: Page) => void;
  onLogout: () => void;
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  currentPage: Page;
  t: (key: TranslationKey) => string;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { children, isLoggedIn, navigateTo, onLogout, selectedLanguage, onSelectLanguage, currentPage, t } = props;
  
  return (
    <>
      {/* Desktop Layout: visible from md upwards */}
      <div className="hidden md:flex min-h-screen w-full">
        <LeftSidebar isLoggedIn={isLoggedIn} navigateTo={navigateTo} onLogout={onLogout} t={t} currentPage={currentPage} />
        <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div key={currentPage} className="w-full h-full flex items-center justify-center animate-fade-in-scale-up">
            {children}
          </div>
        </main>
        <RightSidebar selectedLanguage={selectedLanguage} onSelectLanguage={onSelectLanguage} t={t} />
      </div>

      {/* Mobile Layout: hidden from md upwards */}
      <div className="md:hidden w-full h-screen overflow-hidden">
        <TopBar selectedLanguage={selectedLanguage} onSelectLanguage={onSelectLanguage} t={t} />
        <main className="w-full h-full pt-24 pb-28 overflow-y-auto">
          <div key={currentPage} className="w-full min-h-full flex items-center justify-center animate-fade-in-scale-up p-4">
            {children}
          </div>
        </main>
        <BottomNavBar isLoggedIn={isLoggedIn} navigateTo={navigateTo} onLogout={onLogout} t={t} currentPage={currentPage} />
      </div>
    </>
  );
};

export default Layout;