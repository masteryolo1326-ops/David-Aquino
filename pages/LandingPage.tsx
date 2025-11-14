import React from 'react';
import { Page } from '../types.ts';
import type { TranslationKey } from '../translations.ts';
import { LandingSecureIcon, LandingModernIcon, LandingMultiLingualIcon } from '../constants.tsx';

const LandingPage: React.FC<{ navigateTo: (page: Page) => void; t: (key: TranslationKey) => string; }> = ({ navigateTo, t }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-8 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(250, 204, 21)', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity:1}} />
                    </linearGradient>
                </defs>
                <path fill="url(#grad1)" d="M49.2,-64.8C63.2,-55.8,73.6,-40.4,76.5,-23.9C79.4,-7.4,74.7,10.2,65.6,23.3C56.5,36.5,43.1,45.2,28.8,53C14.5,60.8,-0.7,67.7,-16.1,66.4C-31.4,65.1,-47,55.6,-58,42.8C-69,30,-75.4,14,-75.1,-2.1C-74.8,-18.2,-67.9,-34.4,-55.8,-45.5C-43.7,-56.6,-26.4,-62.7,-9.4,-65.4C7.6,-68.2,25.1,-73.8,49.2,-64.8Z" transform="translate(100 100)" />
            </svg>
        </div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-display mb-4 leading-tight tracking-wide uppercase">
          {t('shapeTomorrow')}
        </h1>
        <h2 className="text-5xl md:text-6xl font-display mb-6 uppercase">
          {t('voteToday')}
        </h2>
        <p className="text-md md:text-lg text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
          {t('landingSubtext')}
        </p>
        <button
          onClick={() => navigateTo(Page.SignUp)}
          className="btn-primary text-white font-bold py-3 px-10 rounded-full text-lg transform hover:scale-105"
        >
          {t('getStarted')}
        </button>
      </div>

      <div className="relative z-10 mt-24 w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-4">
                <div className="flex items-center space-x-3">
                    <LandingSecureIcon />
                    <h3 className="font-semibold text-lg text-white">{t('featureSecureTitle')}</h3>
                </div>
                <p className="text-gray-400 text-sm mt-2">{t('featureSecureText')}</p>
            </div>
             <div className="p-4">
                <div className="flex items-center space-x-3">
                    <LandingModernIcon />
                    <h3 className="font-semibold text-lg text-white">{t('featureModernTitle')}</h3>
                </div>
                <p className="text-gray-400 text-sm mt-2">{t('featureModernText')}</p>
            </div>
             <div className="p-4">
                <div className="flex items-center space-x-3">
                    <LandingMultiLingualIcon />
                    <h3 className="font-semibold text-lg text-white">{t('featureMultiTitle')}</h3>
                </div>
                <p className="text-gray-400 text-sm mt-2">{t('featureMultiText')}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;