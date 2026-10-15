import React, { createContext, useContext, useState, useCallback } from 'react';
import { Quote } from '../../../data/types';
import * as repo from '../../../data/repository';

interface QuotesContextType {
  quotes: Quote[];
  refreshQuotes: () => void;
  submitQuote: (quoteData: {
    jobId: string;
    workerId: string;
    quotedPrice: number;
    voiceNoteUrl?: string;
  }) => Quote;
  getQuotesForJob: (jobId: string) => Quote[];
  getQuotesForWorker: (workerId: string) => Quote[];
  acceptQuote: (quoteId: string) => void;
  declineQuote: (quoteId: string) => void;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>(() => repo.getQuotes());

  const refreshQuotes = useCallback(() => {
    setQuotes([...repo.getQuotes()]);
  }, []);

  const handleSubmitQuote = useCallback(
    (quoteData: {
      jobId: string;
      workerId: string;
      quotedPrice: number;
      voiceNoteUrl?: string;
    }) => {
      const newQuote = repo.submitQuote(quoteData);
      setQuotes([...repo.getQuotes()]);
      return newQuote;
    },
    []
  );

  const getQuotesForJob = useCallback(
    (jobId: string) => {
      return repo.getQuotesForJob(jobId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quotes]
  );

  const getQuotesForWorker = useCallback(
    (workerId: string) => {
      return repo.getQuotesForWorker(workerId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quotes]
  );

  const handleAcceptQuote = useCallback((quoteId: string) => {
    repo.updateQuoteStatus(quoteId, 'accepted');
    setQuotes([...repo.getQuotes()]);
  }, []);

  const handleDeclineQuote = useCallback((quoteId: string) => {
    repo.updateQuoteStatus(quoteId, 'declined');
    setQuotes([...repo.getQuotes()]);
  }, []);

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        refreshQuotes,
        submitQuote: handleSubmitQuote,
        getQuotesForJob,
        getQuotesForWorker,
        acceptQuote: handleAcceptQuote,
        declineQuote: handleDeclineQuote,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
};

export function useQuotes(): QuotesContextType {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used within QuotesProvider');
  }
  return context;
}
