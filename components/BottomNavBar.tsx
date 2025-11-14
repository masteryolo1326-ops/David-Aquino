import React from 'react';
import { Page } from '../types.ts';
import { HomeIcon, UserPlusIcon, LoginIcon, VoteIcon, UserIcon, LogoutIcon, TicketIcon } from '../constants.tsx';
import type { TranslationKey } from '../translations.ts';

interface BottomNavBarProps {
  isLoggedIn: boolean;
  navigateTo: (page: Page) => void;
  onLogout: () => void;
  t: (key: TranslationKey) => string;
  currentPage: Page;
}

const NavItem: React.FC<{ icon: React.ComponentType, label: string, onClick: () => void, isActive: boolean }> = ({ icon: Icon, label, onClick, isActive }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors duration-200 group ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
            <Icon />
        </div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ isLoggedIn, navigateTo, onLogout, t, currentPage }) => {
  return (
    <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-20 glass-container z-20">
      <div className="h-full flex justify-around items-center px-2">
        {isLoggedIn ? (
            <>
              <NavItem icon={VoteIcon} label={t('vote')} onClick={() => navigateTo(Page.Voting)} isActive={currentPage === Page.Voting} />
              <NavItem icon={TicketIcon} label={t('votingTicket')} onClick={() => navigateTo(Page.VotingTicket)} isActive={currentPage === Page.VotingTicket} />
              <NavItem icon={UserIcon} label={t('profile')} onClick={() => {}} isActive={false} />
              <NavItem icon={LogoutIcon} label={t('logout')} onClick={onLogout} isActive={false} />
            </>
        ) : (
            <>
              <NavItem icon={HomeIcon} label={t('home')} onClick={() => navigateTo(Page.Landing)} isActive={currentPage === Page.Landing} />
              <NavItem icon={UserPlusIcon} label={t('signUp')} onClick={() => navigateTo(Page.SignUp)} isActive={currentPage === Page.SignUp} />
              <NavItem icon={LoginIcon} label={t('login')} onClick={() => navigateTo(Page.Login)} isActive={currentPage === Page.Login} />
            </>
        )}
      </div>
    </nav>
  );
};

export default BottomNavBar;