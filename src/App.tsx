import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollToTop";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import CookieConsent from "@/components/CookieConsent";
import MobileCTA from "@/components/MobileCTA";
import { supabase } from "@/integrations/supabase/client";

import WelcomePage from "@/components/WelcomePage";

import Index from "./pages/Index";
import Features from "./pages/Features";
import FeaturesList from "./components/FeaturesList";
import Scenarios from "./pages/Scenarios";
import Pricing from "./pages/Pricing";
import Gift from "./pages/Gift";
import GiftCheckout from "./pages/GiftCheckout";
import GiftSuccess from "./pages/GiftSuccess";
import GiftClaim from "./pages/GiftClaim";

import Auth from "./pages/AuthLegacy";
import Signup from "./pages/SignupLegacy";
import EmailVerification from "./pages/EmailVerification";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import CompletePricing from "./pages/CompletePricing";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import QA from "./pages/QA";
import Welcome from "./pages/Welcome";
import Account from "./pages/Account";
import SampleDashboard from "./pages/SampleDashboard";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import PhotoUpload from "./pages/PhotoUpload";
import VideoUpload from "./pages/VideoUpload";
import DocumentUpload from "./pages/DocumentUpload";
import Inventory from "./pages/Inventory";

import InsuranceForm from "./pages/InsuranceForm";
import ScheduleProfessional from "./pages/ScheduleProfessional";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import PressNews from "./pages/PressNews";
import Resources from "./pages/Resources";
import Feedback from "./pages/Feedback";
import VideoHelp from "./pages/VideoHelp";
import AccountSettings from "./pages/AccountSettings";
import PhotoGallery from "./pages/PhotoGallery";
import Videos from "./pages/Videos";
import Documents from "./pages/Documents";

import Insurance from "./pages/Insurance";
import Claims from "./pages/Claims";
import Legal from "./pages/Legal";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import IndustryRequirements from "./pages/IndustryRequirements";
import Checklists from "./pages/Checklists";
import Glossary from "./pages/Glossary";
import StateRequirements from "./pages/StateRequirements";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import PhotographyGuide from "./pages/PhotographyGuide";

import SocialImpact from "./pages/SocialImpact";
import Partnership from "./pages/Partnership";
import DamagePhotoUpload from "./pages/DamagePhotoUpload";
import DamageVideoUpload from "./pages/DamageVideoUpload";
import AwarenessGuide from "./pages/AwarenessGuide";
import AssetDocumentation from "./pages/AssetDocumentation";
import Admin from "./pages/Admin";
import CompassPartnership from "./pages/CompassPartnership";
import CRM from "./pages/CRM";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

// Protected Route Component with Subscription Guard
const ProtectedRoute = ({ children, skipSubscriptionCheck = false }: { children: React.ReactNode; skipSubscriptionCheck?: boolean }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(!skipSubscriptionCheck);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Testing whitelist - bypass all restrictions for this email
  const isTestingEmail = user?.email === 'michaeljlewis2@gmail.com';
  
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || skipSubscriptionCheck || isTestingEmail) {
        setCheckingSubscription(false);
        if (isTestingEmail) {
          setHasSubscription(true);
        }
        return;
      }

      try {
        const { data } = await supabase.functions.invoke('check-subscription');
        if (data?.subscribed || data?.is_trial) {
          setHasSubscription(true);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    if (user) {
      checkSubscription();
    }
  }, [user, skipSubscriptionCheck, isTestingEmail]);
  
  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Testing email bypasses all checks
  if (isTestingEmail) {
    return <>{children}</>;
  }

  // Check if email is verified (unless on the welcome or subscription pages)
  if (!skipSubscriptionCheck && user && !user.email_confirmed_at) {
    return <Navigate to="/welcome" replace />;
  }

  // Check if user has subscription (unless skipping the check)
  if (!skipSubscriptionCheck && !hasSubscription) {
    return <Navigate to="/subscription-success" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <ScrollToTopWrapper />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features-list" element={<FeaturesList />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/pricing" element={<Pricing />} />
          <Route path="/gift" element={<Gift />} />
          <Route path="/gift-checkout" element={<GiftCheckout />} />
          <Route path="/gift-success" element={<GiftSuccess />} />
          <Route path="/gift-claim" element={<GiftClaim />} />
        <Route path="/subscription-checkout" element={<SubscriptionCheckout />} />
        <Route path="/video-help" element={<VideoHelp />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/sample-dashboard" element={<SampleDashboard />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/complete-pricing" element={<CompletePricing />} />
        
        {/* Public FAQ route */}
        <Route path="/qa" element={<QA />} />
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Welcome page - public to allow unverified users to see it */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Protected routes */}
        <Route path="/subscription-success" element={<ProtectedRoute skipSubscriptionCheck={true}><SubscriptionSuccess /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/account/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/account/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="/account/photos" element={<ProtectedRoute><PhotoGallery /></ProtectedRoute>} />
        <Route path="/account/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
        <Route path="/account/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        
        <Route path="/account/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/account/photos/upload" element={<ProtectedRoute><PhotoUpload /></ProtectedRoute>} />
        <Route path="/account/videos/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
        <Route path="/account/documents/upload" element={<ProtectedRoute><DocumentUpload /></ProtectedRoute>} />
        <Route path="/damage/photos/upload" element={<ProtectedRoute><DamagePhotoUpload /></ProtectedRoute>} />
        <Route path="/damage/videos/upload" element={<ProtectedRoute><DamageVideoUpload /></ProtectedRoute>} />
        
        <Route path="/account/insurance/new" element={<ProtectedRoute><InsuranceForm /></ProtectedRoute>} />
        <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/schedule-professional" element={<ProtectedRoute><ScheduleProfessional /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        
        <Route path="/claims" element={<Claims />} />
        <Route path="/industry-requirements" element={<IndustryRequirements />} />
        <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/state-requirements" element={<StateRequirements />} />
        <Route path="/press-news" element={<PressNews />} />
        <Route path="/press-news/digital-documentation-guide" element={<PressNews />} />
        <Route path="/photography-guide" element={<PhotographyGuide />} />
        
        <Route path="/social-impact" element={<SocialImpact />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/awareness-guide" element={<AwarenessGuide />} />
        <Route path="/asset-documentation" element={<AssetDocumentation />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/crm" element={<CRM />} />
        <Route path="/admin/compass-partnership" element={<CompassPartnership />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileCTA />
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TranslationProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <AppContent />
              <CookieConsent />
            </SubscriptionProvider>
          </AuthProvider>
        </TranslationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
