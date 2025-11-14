import React from 'react';
import { Page } from '../types.ts';
import { HomeIcon, UserPlusIcon, LoginIcon, VoteIcon, UserIcon, LogoutIcon, LogoIcon, TicketIcon } from '../constants.tsx';
import type { TranslationKey } from '../translations.ts';

interface LeftSidebarProps {
  isLoggedIn: boolean;
  navigateTo: (page: Page) => void;
  onLogout: () => void;
  t: (key: TranslationKey) => string;
  currentPage: Page;
}

const NavItem: React.FC<{ icon: React.ComponentType, label: string, onClick: () => void, isActive: boolean }> = ({ icon: Icon, label, onClick, isActive }) => (
    <button onClick={onClick} className={`flex items-center space-x-4 p-3 rounded-lg w-full text-left transition-colors duration-200 group ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
      <span className={isActive ? 'text-yellow-400' : ''}>
          <Icon />
      </span>
      <span className="font-semibold">{label}</span>
    </button>
);

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isLoggedIn, navigateTo, onLogout, t, currentPage }) => {
  return (
    <aside className="w-64 p-4 hidden md:block">
      <div className="h-full glass-container p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-10 p-2 text-white">
            <LogoIcon />
            <h1 className="text-xl font-bold font-display">{t('votingSys')}</h1>
        </div>
        <nav className="flex flex-col space-y-2 flex-grow">
          {isLoggedIn ? (
            <>
              <NavItem icon={VoteIcon} label={t('vote')} onClick={() => navigateTo(Page.Voting)} isActive={currentPage === Page.Voting} />
              <NavItem icon={TicketIcon} label={t('votingTicket')} onClick={() => navigateTo(Page.VotingTicket)} isActive={currentPage === Page.VotingTicket} />
              <NavItem icon={UserIcon} label={t('profile')} onClick={() => {}} isActive={false} />
            </>
          ) : (
            <>
              <NavItem icon={HomeIcon} label={t('home')} onClick={() => navigateTo(Page.Landing)} isActive={currentPage === Page.Landing} />
              <NavItem icon={UserPlusIcon} label={t('signUp')} onClick={() => navigateTo(Page.SignUp)} isActive={currentPage === Page.SignUp} />
              <NavItem icon={LoginIcon} label={t('login')} onClick={() => navigateTo(Page.Login)} isActive={currentPage === Page.Login} />
            </>
          )}
        </nav>
        {isLoggedIn && (
            <div className="mt-auto">
                <NavItem icon={LogoutIcon} label={t('logout')} onClick={onLogout} isActive={false} />
            </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;