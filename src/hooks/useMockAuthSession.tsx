import React, { createContext, useContext, useCallback } from 'react';
import { UserRole } from '../data/types';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import { useLocalStorageState } from './useLocalStorageState';

interface SessionState {
  currentUserId: string;
  currentRole: UserRole;
  onboardingComplete: boolean;
}

const DEFAULT_SESSION: SessionState = {
  currentUserId: 'worker_1',
  currentRole: 'worker',
  onboardingComplete: true, // Default to true so user can immediately experience the app, but easy to re-trigger
};

interface SessionContextType extends SessionState {
  switchRole: (newRole?: UserRole) => void;
  switchUser: (userId: string, role: UserRole) => void;
  completeOnboarding: (role: UserRole) => void;
  resetOnboarding: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useLocalStorageState<SessionState>(
    LOCAL_STORAGE_KEYS.SESSION,
    DEFAULT_SESSION
  );

  const switchRole = useCallback(
    (targetRole?: UserRole) => {
      setSession((prev) => {
        const nextRole: UserRole = targetRole || (prev.currentRole === 'worker' ? 'employer' : 'worker');
        const nextUserId = nextRole === 'worker' ? 'worker_1' : 'emp_1';
        return {
          ...prev,
          currentRole: nextRole,
          currentUserId: nextUserId,
        };
      });
    },
    [setSession]
  );

  const switchUser = useCallback(
    (userId: string, role: UserRole) => {
      setSession((prev) => ({
        ...prev,
        currentUserId: userId,
        currentRole: role,
      }));
    },
    [setSession]
  );

  const completeOnboarding = useCallback(
    (role: UserRole) => {
      setSession((prev) => ({
        ...prev,
        onboardingComplete: true,
        currentRole: role,
        currentUserId: role === 'worker' ? 'worker_1' : 'emp_1',
      }));
    },
    [setSession]
  );

  const resetOnboarding = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      onboardingComplete: false,
    }));
  }, [setSession]);

  return (
    <SessionContext.Provider
      value={{
        ...session,
        switchRole,
        switchUser,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useMockAuthSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useMockAuthSession must be used within SessionProvider');
  }
  return context;
}
