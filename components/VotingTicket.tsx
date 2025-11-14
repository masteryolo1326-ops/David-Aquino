import React, { useEffect, useState } from 'react';
import type { TranslationKey } from '../translations.ts';
import { CheckCircleIcon, ShieldCheckIcon, DocumentArrowDownIcon } from '../constants.tsx';

interface VotingTicketProps {
  t: (key: TranslationKey) => string;
}

const VotingTicket: React.FC<VotingTicketProps> = ({ t }) => {
    const [transactionId, setTransactionId] = useState('');
    const [timestamp, setTimestamp] = useState('');

    useEffect(() => {
        setTransactionId(`VOTE-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`);
        setTimestamp(new Date().toLocaleString());
    }, []);

    const handleDownload = () => {
        alert('Ticket download feature is in development.');
    };

    return (
        <div className="glass-container p-6 md:p-8">
            <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto">
                    <CheckCircleIcon />
                </div>
                <h3 className="text-2xl font-display mt-4">{t('voteConfirmed')}</h3>
                <p className="text-gray-300">{t('thankYouForVoting')}</p>
            </div>
            
            <div className="border-t border-b border-white/10 py-6">
                <div>
                    <p className="text-sm font-semibold text-yellow-400 tracking-widest uppercase">{t('votingTicketTitle')}</p>
                    <div className="mt-2 text-left bg-black/20 p-4 rounded-xl space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-300">{t('transactionId')}:</span>
                            <span className="font-mono text-white break-all text-right">{transactionId}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-300">{t('timestamp')}:</span>
                            <span className="text-white">{timestamp}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-300">{t('status')}:</span>
                            <span className="flex items-center font-bold text-green-400">
                                <ShieldCheckIcon /> {t('verifiedStatus')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 text-center">
                <button
                    onClick={handleDownload}
                    className="btn-primary text-white font-bold py-3 px-6 rounded-full inline-flex items-center justify-center"
                >
                    <DocumentArrowDownIcon />
                    {t('downloadTicket')}
                </button>
            </div>
        </div>
    );
};

export default VotingTicket;