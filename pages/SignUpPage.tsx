import React from 'react';
import { Page } from '../types.ts';
import type { TranslationKey } from '../translations.ts';
import { FormUserIcon, EnvelopeIcon, LockClosedIcon } from '../constants.tsx';

interface SignUpPageProps {
  navigateTo: (page: Page) => void;
  onSignUp: () => void;
  t: (key: TranslationKey) => string;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ navigateTo, onSignUp, t }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp();
  };

  return (
    <div className="flex flex-col items-center justify-center text-white p-4 w-full h-full">
      <div className="w-full max-w-sm p-8 glass-container">
        <div className="text-center mb-6">
            <p className="text-sm font-semibold text-yellow-400 tracking-widest uppercase">{t('step1')}</p>
            <h2 className="text-4xl font-display mt-2">{t('createAccount')}</h2>
            <p className="text-gray-300 mt-2 text-sm">{t('signUpSubtext')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-with-icon">
            <span className="icon"><FormUserIcon /></span>
            <input
              type="text"
              placeholder={t('fullNamePlaceholder')}
              className="glass-input"
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="icon"><EnvelopeIcon /></span>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              className="glass-input"
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="icon"><LockClosedIcon /></span>
            <input
              type="password"
              placeholder={t('passwordPlaceholder')}
              className="glass-input"
              required
            />
          </div>
          <div className="input-with-icon">
            <span className="icon"><LockClosedIcon /></span>
            <input
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              className="glass-input"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary text-white font-bold py-3 px-4"
          >
            {t('signUp')}
          </button>
        </form>
        <p className="text-center text-gray-300 mt-6 text-sm">
          {t('alreadyHaveAccount')}{' '}
          <button onClick={() => navigateTo(Page.Login)} className="font-semibold text-yellow-400 link-primary">
            {t('login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;