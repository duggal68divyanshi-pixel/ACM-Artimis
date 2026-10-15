import React, { createContext, useContext, useState, useCallback } from 'react';
import { NegotiationThread } from '../../../data/types';
import * as repo from '../../../data/repository';

interface NegotiationContextType {
  threads: NegotiationThread[];
  refreshThreads: () => void;
  getThreadById: (threadId: string) => NegotiationThread | undefined;
  getThreadByJobAndWorker: (jobId: string, workerId: string) => NegotiationThread | undefined;
  openOrGetThread: (
    jobId: string,
    workerId: string,
    employerId: string,
    initialOffer: number
  ) => NegotiationThread;
  sendMessage: (
    threadId: string,
    sender: 'worker' | 'employer',
    text: string,
    voiceUrl?: string
  ) => void;
  sendCounterOffer: (
    threadId: string,
    sender: 'worker' | 'employer',
    amount: number,
    text?: string
  ) => void;
  lockTerms: (
    threadId: string,
    terms: { price: number; time: string; paymentMethod: string }
  ) => void;
}

const NegotiationContext = createContext<NegotiationContextType | undefined>(undefined);

export const NegotiationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<NegotiationThread[]>(() => repo.getNegotiationThreads());

  const refreshThreads = useCallback(() => {
    setThreads([...repo.getNegotiationThreads()]);
  }, []);

  const getThreadById = useCallback(
    (threadId: string) => {
      return repo.getNegotiationThreadById(threadId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threads]
  );

  const getThreadByJobAndWorker = useCallback(
    (jobId: string, workerId: string) => {
      return repo.getNegotiationThreadByJobAndWorker(jobId, workerId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threads]
  );

  const handleOpenOrGetThread = useCallback(
    (jobId: string, workerId: string, employerId: string, initialOffer: number) => {
      const thread = repo.openOrGetNegotiationThread(jobId, workerId, employerId, initialOffer);
      setThreads([...repo.getNegotiationThreads()]);
      return thread;
    },
    []
  );

  const handleSendMessage = useCallback(
    (threadId: string, sender: 'worker' | 'employer', text: string, voiceUrl?: string) => {
      repo.postNegotiationMessage(threadId, {
        sender,
        type: voiceUrl ? 'voice' : 'text',
        text,
        voiceUrl,
      });
      setThreads([...repo.getNegotiationThreads()]);
    },
    []
  );

  const handleSendCounterOffer = useCallback(
    (threadId: string, sender: 'worker' | 'employer', amount: number, text?: string) => {
      repo.postNegotiationMessage(threadId, {
        sender,
        type: 'offer',
        offerAmount: amount,
        text: text || `Proposed new offer ₹${amount}`,
      });
      setThreads([...repo.getNegotiationThreads()]);
    },
    []
  );

  const handleLockTerms = useCallback(
    (threadId: string, terms: { price: number; time: string; paymentMethod: string }) => {
      repo.lockNegotiationTerms(threadId, terms);
      setThreads([...repo.getNegotiationThreads()]);
    },
    []
  );

  return (
    <NegotiationContext.Provider
      value={{
        threads,
        refreshThreads,
        getThreadById,
        getThreadByJobAndWorker,
        openOrGetThread: handleOpenOrGetThread,
        sendMessage: handleSendMessage,
        sendCounterOffer: handleSendCounterOffer,
        lockTerms: handleLockTerms,
      }}
    >
      {children}
    </NegotiationContext.Provider>
  );
};

export function useNegotiation(): NegotiationContextType {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiation must be used within NegotiationProvider');
  }
  return context;
}
