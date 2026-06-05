import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { LanguageProvider } from './language/Language.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './lib/queryClient';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <LanguageProvider>
                        <AuthProvider>
                            <App />
                            <Toaster position="bottom-right" richColors closeButton />
                        </AuthProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
);
