import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>
);
