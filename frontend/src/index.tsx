import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

import './index.css'; // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <App />
        <Toaster position="top-right" />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
