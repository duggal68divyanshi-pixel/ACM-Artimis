import React, { createContext, useContext, useState, useCallback } from 'react';
import { WorkerProfile, User } from '../../../data/types';
import * as repo from '../../../data/repository';

interface ProfileContextType {
  getProfile: (userId: string) => WorkerProfile | undefined;
  getUser: (userId: string) => User | undefined;
  updateProfile: (userId: string, updates: Partial<WorkerProfile>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setAvailability: (userId: string, availableToday: boolean) => void;
  setRadius: (userId: string, radiusKm: number) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setTrigger] = useState(0);

  const getProfile = useCallback((userId: string) => {
    return repo.getWorkerProfile(userId);
  }, []);

  const getUser = useCallback((userId: string) => {
    return repo.getUserById(userId);
  }, []);

  const updateProfile = useCallback((userId: string, updates: Partial<WorkerProfile>) => {
    repo.updateWorkerProfile(userId, updates);
    setTrigger((v) => v + 1);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    repo.updateUser(userId, updates);
    setTrigger((v) => v + 1);
  }, []);

  const setAvailability = useCallback((userId: string, availableToday: boolean) => {
    repo.updateWorkerProfile(userId, { availableToday });
    setTrigger((v) => v + 1);
  }, []);

  const setRadius = useCallback((userId: string, radiusKm: number) => {
    repo.updateWorkerProfile(userId, { radiusKm });
    setTrigger((v) => v + 1);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        getProfile,
        getUser,
        updateProfile,
        updateUser,
        setAvailability,
        setRadius,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
