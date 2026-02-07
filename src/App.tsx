import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import useScrollToTop from "@/hooks/useScrollToTop";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { ContributorProvider } from "@/contexts/ContributorContext";
import CookieConsent from "@/components/CookieConsent";
import MobileCTA from "@/components/MobileCTA";
import AskAssetSafe from "@/components/AskAssetSafe";
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
import PropertyAllAssets from "./pages/PropertyAllAssets";
import PhotoUpload from "./pages/PhotoUpload";
import VideoUpload from "./pages/VideoUpload";
import DocumentUpload from "./pages/DocumentUpload";
import Inventory from "./pages/Inventory";
import CombinedMedia from "./pages/CombinedMedia";
import CombinedMediaUpload from "./pages/CombinedMediaUpload";
import MediaEdit from "./pages/MediaEdit";

import InsuranceForm from "./pages/InsuranceForm";
import InsuranceDetail from "./pages/InsuranceDetail";
import InsuranceEdit from "./pages/InsuranceEdit";
import DocumentEdit from "./pages/DocumentEdit";
import ScheduleProfessional from "./pages/ScheduleProfessional";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import PressNews from "./pages/PressNews";
import Resources from "./pages/Resources";
import Feedback from "./pages/Feedback";
import VideoHelp from "./pages/VideoHelp";
import TestEmail from "./pages/TestEmail";
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
import AdminShell from "./components/admin/AdminShell";
import AdminOwnerWorkspace from "./components/admin/AdminOwnerWorkspace";
import AdminDevWorkspace from "./components/admin/AdminDevWorkspace";
import CompassPartnership from "./pages/CompassPartnership";
import HomeImprovementPartnership from "./pages/HomeImprovementPartnership";
import AHAPartnership from "./pages/AHAPartnership";
import ARAPartnership from "./pages/ARAPartnership";
import B2BOpportunities from "./pages/B2BOpportunities";
import DevPartnerStrategy from "./pages/DevPartnerStrategy";
import HabitatPartnership from "./pages/HabitatPartnership";
import EnterpriseWhiteLabel from "./pages/EnterpriseWhiteLabel";
import HabitatPilot from "./pages/HabitatPilot";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CRM from "./pages/CRM";
import AcknowledgeAccess from "./pages/AcknowledgeAccess";
import ActivityLog from "./pages/ActivityLog";
import ForgotPassword from "./pages/ForgotPassword";
import LegacyLockerInfo from "./pages/LegacyLockerInfo";
import ContributorWelcome from "./pages/ContributorWelcome";
import CookiePolicy from "./pages/CookiePolicy";
import Install from "./pages/Install";
import VIPContacts from "./pages/VIPContacts";
import SubscriptionAgreement from "./pages/SubscriptionAgreement";
import DevInviteAccept from "./pages/DevInviteAccept";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

// Protected Route Component with Subscription Guard
// NOTE: TOTP-based 2FA is used for sensitive actions (Secure Vault, billing, etc.) - not on every login
const ProtectedRoute = ({ children, skipSubscriptionCheck = false }: { children: React.ReactNode; skipSubscriptionCheck?: boolean }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(!skipSubscriptionCheck);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [allowFreeAccess, setAllowFreeAccess] = useState(false);

  useEffect(() => {
    const checkSubscription = async (retryCount = 0) => {
      if (!user || skipSubscriptionCheck) {
        setCheckingSubscription(false);
        return;
      }

      try {
        // First, try to accept any pending contributor invitations
        if (retryCount === 0) {
          try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
              await supabase.functions.invoke('accept-contributor-invitation');
            }
          } catch (inviteError) {
            console.log('Invitation acceptance check:', inviteError);
          }
        }

        const { data } = await supabase.functions.invoke('check-subscription');
        
        // Check if user has active subscription OR free tier access
        if (data?.subscribed || data?.subscription_tier === 'free') {
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }
        
        // Allow free tier access for users without paid subscription
        // This includes ASL2025 lifetime code users and new signups
        if (data && !data.subscribed) {
          setAllowFreeAccess(true);
          setCheckingSubscription(false);
          return;
        }
        
        // Fallback: Check contributor status directly if subscription check fails
        // IMPORTANT: Must also verify owner's subscription is active
        if (retryCount >= 2) {
          const { data: contributorData } = await supabase
            .from('contributors')
            .select('id, account_owner_id, role, status')
            .eq('contributor_user_id', user.id)
            .eq('status', 'accepted')
            .limit(1);
          
          if (contributorData && contributorData.length > 0) {
            // Must verify the owner has an active subscription before granting access
            const { data: ownerProfile } = await supabase
              .from('profiles')
              .select('plan_status')
              .eq('user_id', contributorData[0].account_owner_id)
              .single();
            
            const ownerIsActive = ownerProfile?.plan_status === 'active' || ownerProfile?.plan_status === 'trialing';
            
            if (ownerIsActive) {
              console.log('Found accepted contributor relationship with active owner, granting access');
              setHasSubscription(true);
              setCheckingSubscription(false);
              return;
            } else {
              console.log('Contributor owner subscription is inactive, denying access');
            }
          }
        }
        
        if (retryCount < 3) {
          // Retry after a short delay to allow invitation acceptance to complete
          setTimeout(() => checkSubscription(retryCount + 1), 1500);
          return;
        }
        
        setCheckingSubscription(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        // On error, retry
        if (retryCount < 3) {
          setTimeout(() => checkSubscription(retryCount + 1), 1500);
          return;
        }
        setCheckingSubscription(false);
      }
    };

    if (user) {
      checkSubscription();
    }
  }, [user, skipSubscriptionCheck]);
  
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


  // Check if email is verified (unless on the welcome or subscription pages)
  if (!skipSubscriptionCheck && user && !user.email_confirmed_at) {
    return <Navigate to="/welcome" replace />;
  }

  // Check if user has subscription (unless skipping the check)
  if (!skipSubscriptionCheck && !hasSubscription && !allowFreeAccess) {
    return <Navigate to="/pricing" replace />;
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
        <Route path="/subscription-agreement" element={<SubscriptionAgreement />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/install" element={<Install />} />
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
        <Route path="/test-email" element={<TestEmail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/sample-dashboard" element={<SampleDashboard />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* TOTP-based 2FA is now used instead of phone verification */}
        <Route path="/complete-pricing" element={<CompletePricing />} />
        
        {/* Public FAQ route */}
        <Route path="/qa" element={<QA />} />
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Welcome page - public to allow unverified users to see it */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/contributor-welcome" element={<ContributorWelcome />} />
        
        {/* Protected routes */}
        <Route path="/subscription-success" element={<ProtectedRoute skipSubscriptionCheck={true}><SubscriptionSuccess /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/account/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/account/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="/account/properties/:propertyId/assets" element={<ProtectedRoute><PropertyAllAssets /></ProtectedRoute>} />
        <Route path="/account/photos" element={<ProtectedRoute><PhotoGallery /></ProtectedRoute>} />
        <Route path="/account/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
        <Route path="/account/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/account/media" element={<ProtectedRoute><CombinedMedia /></ProtectedRoute>} />
        <Route path="/account/media/upload" element={<ProtectedRoute><CombinedMediaUpload /></ProtectedRoute>} />
        <Route path="/account/media/:id/edit" element={<ProtectedRoute><MediaEdit /></ProtectedRoute>} />
        
        <Route path="/account/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/account/photos/upload" element={<ProtectedRoute><PhotoUpload /></ProtectedRoute>} />
        <Route path="/account/videos/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
        <Route path="/account/documents/upload" element={<ProtectedRoute><DocumentUpload /></ProtectedRoute>} />
        <Route path="/damage/photos/upload" element={<ProtectedRoute><DamagePhotoUpload /></ProtectedRoute>} />
        <Route path="/damage/videos/upload" element={<ProtectedRoute><DamageVideoUpload /></ProtectedRoute>} />
        
        <Route path="/account/insurance/new" element={<ProtectedRoute><InsuranceForm /></ProtectedRoute>} />
        <Route path="/account/insurance/:id" element={<ProtectedRoute><InsuranceDetail /></ProtectedRoute>} />
        <Route path="/account/insurance/:id/edit" element={<ProtectedRoute><InsuranceEdit /></ProtectedRoute>} />
        <Route path="/account/documents/:id/edit" element={<ProtectedRoute><DocumentEdit /></ProtectedRoute>} />
        <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/account/contacts" element={<ProtectedRoute><VIPContacts /></ProtectedRoute>} />
        <Route path="/schedule-professional" element={<ProtectedRoute><ScheduleProfessional /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/account/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        
        <Route path="/claims" element={<Claims />} />
        <Route path="/industry-requirements" element={<IndustryRequirements />} />
        <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/state-requirements" element={<StateRequirements />} />
        <Route path="/press-news" element={<PressNews />} />
        <Route path="/press-news/digital-documentation-guide" element={<PressNews />} />
        <Route path="/photography-guide" element={<PhotographyGuide />} />
        
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        <Route path="/social-impact" element={<SocialImpact />} />
        <Route path="/legacy-locker-info" element={<LegacyLockerInfo />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/awareness-guide" element={<AwarenessGuide />} />
        <Route path="/asset-documentation" element={<AssetDocumentation />} />
        
        {/* Admin Routes with Nested Workspaces */}
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={null} /> {/* Will redirect based on role */}
          <Route path="owner" element={<AdminOwnerWorkspace />} />
          <Route path="dev" element={<AdminDevWorkspace />} />
        </Route>
        
        <Route path="/admin/crm" element={<CRM />} />
        <Route path="/admin/compass-partnership" element={<CompassPartnership />} />
        <Route path="/admin/home-improvement-partnership" element={<HomeImprovementPartnership />} />
        <Route path="/admin/aha-partnership" element={<AHAPartnership />} />
        <Route path="/admin/ara-partnership" element={<ARAPartnership />} />
        <Route path="/admin/b2b-opportunities" element={<B2BOpportunities />} />
        <Route path="/admin/dev-partner-strategy" element={<DevPartnerStrategy />} />
        <Route path="/admin/habitat-partnership" element={<HabitatPartnership />} />
        <Route path="/admin/habitat-pilot" element={<HabitatPilot />} />
        <Route path="/admin/enterprise" element={<EnterpriseWhiteLabel />} />
        <Route path="/admin/dev-invite" element={<DevInviteAccept />} />
        <Route path="/acknowledge-access" element={<AcknowledgeAccess />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileCTA />
      <AskAssetSafe />
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TranslationProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <ContributorProvider>
                  <AppContent />
                  <CookieConsent />
                </ContributorProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </TranslationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
