import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Job } from '../../../data/types';
import * as repo from '../../../data/repository';

interface JobsContextType {
  jobs: Job[];
  refreshJobs: () => void;
  postJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'status'>) => Job;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  getJobsForWorkerFeed: (workerId: string) => Job[];
  getJobsForEmployer: (employerId: string) => Job[];
  getJobById: (jobId: string) => Job | undefined;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(() => repo.getJobs());

  const refreshJobs = useCallback(() => {
    setJobs([...repo.getJobs()]);
  }, []);

  const handlePostJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt' | 'status'>) => {
    const newJob = repo.postJob(jobData);
    setJobs([...repo.getJobs()]);
    return newJob;
  }, []);

  const handleUpdateJobStatus = useCallback((jobId: string, status: Job['status']) => {
    repo.updateJobStatus(jobId, status);
    setJobs([...repo.getJobs()]);
  }, []);

  const getJobsForWorkerFeed = useCallback(
    (workerId: string) => {
      return repo.getJobsForWorkerFeed(workerId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs]
  );

  const getJobsForEmployer = useCallback(
    (employerId: string) => {
      return repo.getJobsForEmployer(employerId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs]
  );

  const getJobById = useCallback(
    (jobId: string) => {
      return repo.getJobById(jobId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs]
  );

  return (
    <JobsContext.Provider
      value={{
        jobs,
        refreshJobs,
        postJob: handlePostJob,
        updateJobStatus: handleUpdateJobStatus,
        getJobsForWorkerFeed,
        getJobsForEmployer,
        getJobById,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export function useJobs(): JobsContextType {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within JobsProvider');
  }
  return context;
}
