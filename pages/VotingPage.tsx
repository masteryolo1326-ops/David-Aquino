import React, { useState } from 'react';
import Confetti from 'react-confetti';
import SlateCard from '../components/SlateCard.tsx';
import { SLATES_DATA, VoteIcon } from '../constants.tsx';
import type { TranslationKey } from '../translations.ts';
import Modal from '../components/Modal.tsx';
import type { Slate } from '../types.ts';
import VotingTicket from '../components/VotingTicket.tsx';

interface VotingPageProps {
  t: (key: TranslationKey) => string;
  votedSlate: Slate | null;
  setVotedSlate: (slate: Slate | null) => void;
}

const VotingPage: React.FC<VotingPageProps> = ({ t, votedSlate, setVotedSlate }) => {
  const [selectedSlate, setSelectedSlate] = useState<Slate | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVote = (id: number) => {
    if (votedSlate === null) {
      const slateToConfirm = SLATES_DATA.find(s => s.id === id);
      if (slateToConfirm) {
        setSelectedSlate(slateToConfirm);
        setConfirmModalOpen(true);
      }
    }
  };

  const confirmVote = () => {
    if (selectedSlate) {
      setVotedSlate(selectedSlate);
      setConfirmModalOpen(false);
      setSelectedSlate(null);
      setShowConfetti(true);
    }
  };

  const cancelVote = () => {
    setConfirmModalOpen(false);
    setSelectedSlate(null);
  };

  return (
    <div className="w-full text-white flex flex-col max-w-4xl mx-auto">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={400}
          gravity={0.1}
          onConfettiComplete={() => setShowConfetti(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}
        />
      )}
      <div className="text-center pt-4 pb-6 flex flex-col items-center">
        <div className="text-yellow-400"><VoteIcon /></div>
        <h2 className="text-4xl font-display mt-2">{t('castYourVote')}</h2>
        <p className="text-lg text-gray-300 mt-2 max-w-lg">{t('votingHeaderSubtext')}</p>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SLATES_DATA.map((slate) => (
            <SlateCard
              key={slate.id}
              slate={slate}
              onVote={handleVote}
              isSelected={votedSlate !== null}
              t={t}
            />
          ))}
        </div>
      </div>
      {votedSlate && (
        <div className="mt-8 w-full animate-fade-in-scale-up">
            <VotingTicket t={t} />
        </div>
      )}

      <Modal isOpen={isConfirmModalOpen} onClose={cancelVote}>
        {selectedSlate && (
          <div className="text-center">
            <h3 className="text-2xl font-bold font-display mb-2">{t('confirmYourVote')}</h3>
            <p className="text-gray-300 mb-6 text-sm">
                {t('youAreVotingFor')}
            </p>
            <div className="text-left bg-black/20 p-4 rounded-2xl mb-6 border border-white/10">
                <h4 className="text-xl font-display font-bold text-yellow-400">{selectedSlate.name}</h4>
                <p className="text-sm text-gray-200 mt-2">
                    <span className="font-semibold">{t('president')}:</span> {selectedSlate.president}
                </p>
                <p className="text-sm text-gray-200 mt-1">
                    <span className="font-semibold">{t('vicePresident')}:</span> {selectedSlate.vicePresident}
                </p>
            </div>
            <div className="flex justify-center gap-4">
                 <button
                    onClick={cancelVote}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                    {t('cancel')}
                </button>
                <button
                    onClick={confirmVote}
                    className="btn-primary text-white font-bold py-2 px-6 rounded-full"
                >
                    {t('confirmVoteButton')}
                </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VotingPage;