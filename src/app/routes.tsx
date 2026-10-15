import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMockAuthSession } from '../hooks/useMockAuthSession';

// Screens
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { JobReelFeed } from '../features/worker-jobs/screens/JobReelFeed';
import { MyQuotes } from '../features/worker-jobs/screens/MyQuotes';
import { PostJob } from '../features/employer-jobs/screens/PostJob';
import { MyJobs } from '../features/employer-jobs/screens/MyJobs';
import { JobQuotesList } from '../features/employer-jobs/screens/JobQuotesList';
import { NegotiationThreadScreen } from '../features/negotiation/screens/NegotiationThreadScreen';
import { MessagesInboxScreen } from '../features/negotiation/screens/MessagesInboxScreen';
import { JobExecutionScreen } from '../features/execution/screens/JobExecutionScreen';
import { RateJobScreen } from '../features/reviews/screens/RateJobScreen';
import { WorkerProfileScreen } from '../features/profile/screens/WorkerProfileScreen';
import { ChowkMapScreen } from '../features/chowk-map/screens/ChowkMapScreen';
import { RightsScreen } from '../features/rights/screens/RightsScreen';
import { DiaryScreen } from '../features/diary/screens/DiaryScreen';

export const AppRoutes: React.FC = () => {
  const { currentRole, onboardingComplete } = useMockAuthSession();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          !onboardingComplete ? (
            <Navigate to="/onboarding" replace />
          ) : currentRole === 'worker' ? (
            <Navigate to="/jobs" replace />
          ) : (
            <Navigate to="/my-jobs" replace />
          )
        }
      />

      {/* Onboarding */}
      <Route path="/onboarding" element={<OnboardingScreen />} />

      {/* Worker Navigation */}
      <Route path="/jobs" element={<JobReelFeed />} />
      <Route path="/quotes" element={<MyQuotes />} />
      <Route path="/chowk" element={<ChowkMapScreen />} />
      <Route path="/rights" element={<RightsScreen />} />
      <Route path="/diary" element={<DiaryScreen />} />

      {/* Employer Navigation */}
      <Route path="/my-jobs" element={<MyJobs />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/employer/job/:jobId" element={<JobQuotesList />} />
      <Route path="/messages" element={<MessagesInboxScreen />} />

      {/* Common Screens */}
      <Route path="/negotiation/:threadId" element={<NegotiationThreadScreen />} />
      <Route path="/job-execution/:jobId" element={<JobExecutionScreen />} />
      <Route path="/rate/:jobId" element={<RateJobScreen />} />
      <Route path="/profile" element={<WorkerProfileScreen />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
