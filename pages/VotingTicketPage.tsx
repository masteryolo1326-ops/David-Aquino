import React from 'react';
import type { Slate } from '../types.ts';
import type { TranslationKey } from '../translations.ts';
import VotingTicket from '../components/VotingTicket.tsx';

interface VotingTicketPageProps {
  votedSlate: Slate | null;
  t: (key: TranslationKey) => string;
}

const VotingTicketPage: React.FC<VotingTicketPageProps> = ({ votedSlate, t }) => {
  if (!votedSlate) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-white p-8 w-full h-full max-w-md mx-auto">
        <div className="mb-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-16" fill="currentColor">
              <path fillRule="evenodd" d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5A2.25 2.25 0 0 1 22.5 6.75v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75ZM8.25 17.25a.75.75 0 0 0 0-1.5h7.5a.75.75 0 0 0 0 1.5h-7.5ZM8.25 13.5a.75.75 0 0 0 0-1.5h7.5a.75.75 0 0 0 0 1.5h-7.5ZM8.25 9.75a.75.75 0 0 0 0-1.5h7.5a.75.75 0 0 0 0 1.5h-7.5Z" clipRule="evenodd" />
            </svg>
        </div>
        <h2 className="text-3xl font-display mt-2">{t('votingTicket')}</h2>
        <p className="text-lg text-gray-300 mt-2">{t('noVoteCastYet')}</p>
      </div>
    );
  }

  return (
    <div className="w-full text-white flex flex-col max-w-4xl mx-auto p-4 animate-fade-in-scale-up">
      <VotingTicket t={t} />
    </div>
  );
};

export default VotingTicketPage;