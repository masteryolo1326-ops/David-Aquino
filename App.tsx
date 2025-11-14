import React, { useState, useCallback } from 'react';
import { Page } from './types.ts';
import type { Language, Slate } from './types.ts';
import { LANGUAGES, CheckCircleIcon } from './constants.tsx';
import Modal from './components/Modal.tsx';
import LandingPage from './pages/LandingPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import VotingPage from './pages/VotingPage.tsx';
import VotingTicketPage from './pages/VotingTicketPage.tsx';
import Layout from './components/Layout.tsx';
import { translations } from './translations.ts';
import type { TranslationKey } from './translations.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showSignUpSuccessModal, setShowSignUpSuccessModal] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]); // Default to Spanish
  const [votedSlate, setVotedSlate] = useState<Slate | null>(null);

  const t = useCallback((key: TranslationKey): string => {
    return (translations as any)[language.code]?.[key] 
        || translations.en[key] 
        || key;
  }, [language]);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
    navigateTo(Page.Voting);
  }, [navigateTo]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setVotedSlate(null);
    navigateTo(Page.Landing);
  }, [navigateTo]);

  const handleSignUp = useCallback(() => {
    setShowSignUpSuccessModal(true);
  }, []);

  const closeSignUpModal = useCallback(() => {
    setShowSignUpSuccessModal(false);
    navigateTo(Page.Login);
  }, [navigateTo]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.SignUp:
        return <SignUpPage navigateTo={navigateTo} onSignUp={handleSignUp} t={t} />;
      case Page.Login:
        return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} t={t} />;
      case Page.Voting:
        return isLoggedIn ? <VotingPage t={t} votedSlate={votedSlate} setVotedSlate={setVotedSlate} /> : <LoginPage navigateTo={navigateTo} onLogin={handleLogin} t={t} />;
      case Page.VotingTicket:
        return isLoggedIn ? <VotingTicketPage t={t} votedSlate={votedSlate} /> : <LoginPage navigateTo={navigateTo} onLogin={handleLogin} t={t} />;
      case Page.Landing:
      default:
        return <LandingPage navigateTo={navigateTo} t={t} />;
    }
  };

  return (
    <div className="min-h-screen w-full animated-gradient relative">
      {/* Global SVG Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Orbs */}
      <div className="absolute -top-60 -left-96 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-yellow-900 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse orb"></div>
      <div className="absolute -bottom-60 -right-96 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-blue-900 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse orb" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] md:w-[900px] md:h-[900px] bg-yellow-800 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse orb" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-blue-800 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse orb" style={{animationDelay: '3s'}}></div>

      <Layout
        isLoggedIn={isLoggedIn}
        navigateTo={navigateTo}
        onLogout={handleLogout}
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
        currentPage={currentPage}
        t={t}
      >
        {renderPage()}
      </Layout>
      
      <Modal isOpen={showSignUpSuccessModal} onClose={closeSignUpModal}>
          <div className="text-center">
              <CheckCircleIcon />
              <h3 className="text-2xl font-bold font-display mt-4 mb-2">{t('registrationSuccessful')}</h3>
              <p className="text-gray-300 mb-6">
                  {t('checkInbox')}
              </p>
              <button
                  onClick={closeSignUpModal}
                  className="btn-primary text-white font-bold py-2 px-6 rounded-full"
              >
                  {t('proceedToLogin')}
              </button>
          </div>
      </Modal>
    </div>
  );
}