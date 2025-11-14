import React from 'react';
import type { Slate } from '../types.ts';
import type { TranslationKey } from '../translations.ts';
import { UserCircleIcon } from '../constants.tsx';


interface SlateCardProps {
  slate: Slate;
  onVote: (id: number) => void;
  isSelected: boolean;
  t: (key: TranslationKey) => string;
}

const SlateCard: React.FC<SlateCardProps> = ({ slate, onVote, isSelected, t }) => {
  return (
    <div className="glass-container glass-interactive group">
      <div className="relative">
        <img src={slate.imageUrl} alt={slate.name} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-display font-bold text-white shadow-black/50 shadow-sm">{slate.name}</h3>
        </div>
      </div>
      <div className="p-4 text-white flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-200 flex items-center gap-2">
              <UserCircleIcon />
              <span className="font-semibold">{t('president')}:</span> {slate.president}
            </p>
            <p className="text-sm text-gray-200 flex items-center gap-2 mt-1">
              <UserCircleIcon />
              <span className="font-semibold">{t('vicePresident')}:</span> {slate.vicePresident}
            </p>
        </div>
        <button
          onClick={() => onVote(slate.id)}
          className={`btn-primary px-6 py-2 rounded-full font-bold text-sm text-white ${
            isSelected
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          disabled={isSelected}
        >
          {isSelected ? t('voted') : t('voteForThisSlate')}
        </button>
      </div>
    </div>
  );
};

export default SlateCard;