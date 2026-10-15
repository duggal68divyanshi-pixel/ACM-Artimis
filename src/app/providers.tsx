import React, { useEffect } from 'react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { SessionProvider } from '../hooks/useMockAuthSession';
import { JobsProvider } from '../features/worker-jobs/state/JobsContext';
import { QuotesProvider } from '../features/worker-jobs/state/QuotesContext';
import { NegotiationProvider } from '../features/negotiation/state/NegotiationContext';
import { ProfileProvider } from '../features/profile/state/ProfileContext';
import { initializeRepository } from '../data/repository';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeRepository();
  }, []);

  return (
    <LanguageProvider>
      <SessionProvider>
        <JobsProvider>
          <QuotesProvider>
            <NegotiationProvider>
              <ProfileProvider>{children}</ProfileProvider>
            </NegotiationProvider>
          </QuotesProvider>
        </JobsProvider>
      </SessionProvider>
    </LanguageProvider>
  );
};
