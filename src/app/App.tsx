import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <div className="w-full min-h-screen bg-surface-canvas flex justify-center text-on-surface">
          <div className="w-full max-w-md bg-surface-canvas min-h-screen relative shadow-2xl">
            <AppRoutes />
          </div>
        </div>
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
