import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AppProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AppProvider>
    </ToastProvider>
  </React.StrictMode>
);
