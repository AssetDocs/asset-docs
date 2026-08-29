// @ts-nocheck
import { useState, useEffect, useRef } from "react";
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
import { AccountProvider, useContributor } from "@/contexts/AccountContext";
import { StepUpProvider } from "@/contexts/StepUpContext";
import IdleWarningDialog from "@/components/IdleWarningDialog";
import CookieConsent from "@/components/CookieConsent";
import MobileCTA from "@/components/MobileCTA";
import AskAssetSafe from "@/components/AskAssetSafe";
import SystemMaintenanceBanner from "@/components/SystemMaintenanceBanner";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";

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
import GiftRedeem from "./pages/GiftRedeem";

import Auth from "./pages/AuthLegacy";
import Signup from "./pages/SignupLegacy";
import CreatePassword from "./pages/CreatePassword";
import Onboarding from "./pages/Onboarding";
import EmailVerification from "./pages/EmailVerification";
import AuthCallback from "./pages/AuthCallback";
import AuthContinue from "./pages/AuthContinue";
import VerifyEmail from "./pages/VerifyEmail";
import ConfirmEmailChange from "./pages/ConfirmEmailChange";
import CompletePricing from "./pages/CompletePricing";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import ContinuityDispute from "./pages/ContinuityDispute";
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
import MemoryUpload from "./pages/MemoryUpload";
import MemoryEdit from "./pages/MemoryEdit";
import ScheduleProfessional from "./pages/ScheduleProfessional";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AccountAssistance from "./pages/AccountAssistance";
import Testimonials from "./pages/Testimonials";
import Resources from "./pages/Resources";
import Feedback from "./pages/Feedback";
import VideoHelp from "./pages/VideoHelp";
import TestEmail from "./pages/TestEmail";
import AccountSettings from "./pages/AccountSettings";
import PhotoGallery from "./pages/PhotoGallery";
import Videos from "./pages/Videos";
import Documents from "./pages/Documents";
import CleanupQueue from "./pages/CleanupQueue";

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
import DigitalDocumentationGuide from "./pages/DigitalDocumentationGuide";
import HomeInventory from "./pages/HomeInventory";
import Renters from "./pages/Renters";
import Landlords from "./pages/Landlords";
import SmallBusiness from "./pages/SmallBusiness";

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
import DelegateVault from "./pages/DelegateVault";

import ActivityLog from "./pages/ActivityLog";
import ForgotPassword from "./pages/ForgotPassword";
import LegacyLockerInfo from "./pages/LegacyLockerInfo";
import InviteLanding from "./pages/InviteLanding";
import CookiePolicy from "./pages/CookiePolicy";
import Install from "./pages/Install";
import VIPContacts from "./pages/VIPContacts";

import DevInviteAccept from "./pages/DevInviteAccept";
import PhotographerInterest from "./pages/PhotographerInterest";
import LenderPartnership from "./pages/LenderPartnership";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

const RouteMeta = ({ title, description, path, noIndex = true, children }: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  children: React.ReactNode;
}) => (
  <>
    <SEOHead
      title={title}
      description={description}
      canonicalUrl={`https://getassetsafe.com${path}`}
      noIndex={noIndex}
    />
    {children}
  </>
);

// Protected Route Component with Subscription Guard
// NOTE: TOTP-based 2FA is used for sensitive actions (Secure Vault, billing, etc.) - not on every login
const ProtectedRoute = ({ children, skipSubscriptionCheck = false }: { children: React.ReactNode; skipSubscriptionCheck?: boolean }) => {
  const { isAuthenticated, loading, profileLoading, user, profile } = useAuth();
  const adminRole = useAdminRole();
  const [checkingSubscription, setCheckingSubscription] = useState(!skipSubscriptionCheck);
  const [hasSubscription, setHasSubscription] = useState(false);
  // Abort flag: set to true when the component unmounts or user changes, so in-flight
  // setTimeout retries don't update state on a stale/unmounted component.
  const abortRef = useRef(false);
  // Track which user ID we've already confirmed a subscription for — prevents
  // re-running the full check on every token refresh (tab switch → TOKEN_REFRESHED).
  const checkedUserIdRef = useRef<string | null>(null);

  // Admin users bypass the subscription gate entirely — they always have full access
  const isAdminUser = !adminRole.loading && adminRole.hasDevAccess;

  // Check membership status early so we can bypass the subscription gate for authorized users
  const { isContributor: isMemberUser, loading: memberLoading } = useContributor();

  useEffect(() => {
    // Skip subscription check for admin users
    if (isAdminUser) {
      setHasSubscription(true);
      setCheckingSubscription(false);
      return;
    }

    // Non-owner members inherit access via account owner's subscription — bypass subscription gate
    if (!memberLoading && isMemberUser) {
      checkedUserIdRef.current = user?.id ?? null;
      setHasSubscription(true);
      setCheckingSubscription(false);
      return;
    }

    // If we've already confirmed a subscription for this user ID, don't re-run
    // the check just because the token refreshed (new user object, same user.id).
    if (user?.id && checkedUserIdRef.current === user.id && hasSubscription) {
      setCheckingSubscription(false);
      return;
    }

    // Reset abort flag for this effect run
    abortRef.current = false;

    const checkSubscription = async (retryCount = 0) => {
      // Bail out if component unmounted or user changed
      if (abortRef.current) return;

      if (!user || skipSubscriptionCheck) {
        setCheckingSubscription(false);
        return;
      }

      try {
    // Check for active membership (non-owner members bypass subscription gate)
    if (retryCount === 0) {
      try {
        const { data: membership } = await supabase
          .from('account_memberships')
          .select('id, role')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .neq('role', 'owner')
          .limit(1)
          .maybeSingle();

        if (membership) {
          checkedUserIdRef.current = user.id;
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }
      } catch (membershipError) {
        console.log('Membership check error (non-fatal):', membershipError);
      }
    }

        if (abortRef.current) return;

        const { data, error } = await supabase.functions.invoke('check-subscription');

        if (abortRef.current) return;
        
        // If the invoke itself failed (network error, CORS, etc.), data will be null.
        // For an authenticated user we fail open rather than bouncing them to /pricing.
        if (!data && error) {
          console.warn('check-subscription invoke error, failing open for authenticated user:', error);
          checkedUserIdRef.current = user.id;
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }

        // Check if user has active subscription OR any recognized tier
        if (data?.subscribed || data?.subscription_tier === 'free' || data?.subscription_tier === 'premium' || data?.subscription_tier === 'standard') {
          checkedUserIdRef.current = user.id;
          setHasSubscription(true);
          setCheckingSubscription(false);
          return;
        }

        // Fallback: re-check membership via account_memberships if subscription check fails
        if (retryCount >= 2) {
          try {
            const { data: membershipData } = await supabase
              .from('account_memberships')
              .select('id, role')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .neq('role', 'owner')
              .limit(1)
              .maybeSingle();

            if (abortRef.current) return;

            if (membershipData) {
              checkedUserIdRef.current = user.id;
              setHasSubscription(true);
              setCheckingSubscription(false);
              return;
            }
          } catch (memberErr) {
            console.log('Membership fallback check error (non-fatal):', memberErr);
          }
        }
        
        if (retryCount < 3) {
          const timerId = setTimeout(() => checkSubscription(retryCount + 1), 1500);
          if (abortRef.current) clearTimeout(timerId);
          return;
        }
        
        setCheckingSubscription(false);
      } catch (error) {
        if (abortRef.current) return;
        console.error('Error checking subscription:', error);
        checkedUserIdRef.current = user?.id ?? null;
        setHasSubscription(true);
        setCheckingSubscription(false);
      }
    };

    if (user) {
      setCheckingSubscription(!skipSubscriptionCheck);
      checkSubscription();
    } else if (!loading) {
      // User logged out — clear the cached user ID so the next login re-checks
      checkedUserIdRef.current = null;
      setCheckingSubscription(false);
    }

    return () => {
      abortRef.current = true;
    };
  }, [user?.id, skipSubscriptionCheck, loading, isAdminUser, isMemberUser, memberLoading]);
  
  // Wait for auth + admin role loading + membership status + subscription check
  if (loading || profileLoading || adminRole.loading || memberLoading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Admin users: skip all subscription and email-verification gates
  if (isAdminUser) {
    return <>{children}</>;
  }

  // Non-owner members (authorized users): inherit access from the owner's
  // account. They set a real password during signup and never run the owner
  // onboarding wizard, so bypass the password_set / onboarding_complete /
  // email_confirmed / subscription gates entirely.
  if (!memberLoading && isMemberUser) {
    return <>{children}</>;
  }

  // Enforce password setup for new users (catches both null and false)
  if (profile && !profile.password_set) {
    return <Navigate to="/welcome/create-password" replace />;
  }

  // Enforce onboarding for users who haven't completed it
  if (profile && profile.password_set === true && profile.onboarding_complete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if email is verified — also bypass if user_metadata marks them as
  // an invited user (covers the JWT-refresh race window before membership
  // re-resolves).
  const isInvitedUser = !!user?.user_metadata?.invited_as_contributor;
  if (!skipSubscriptionCheck && user && !user.email_confirmed_at && !isInvitedUser) {
    return <Navigate to="/welcome" replace />;
  }

  // Check if user has subscription
  if (!skipSubscriptionCheck && !hasSubscription) {
    return <Navigate to="/pricing" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <ScrollToTopWrapper />
      <SystemMaintenanceBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features-list" element={<RouteMeta title="Features List" description="Browse Asset Safe features for organizing assets, records, property details, memories, and continuity tools." path="/features-list"><FeaturesList /></RouteMeta>} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/subscription-agreement" element={<Navigate to="/terms" replace />} />
        
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/install" element={<Install />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account-assistance" element={<AccountAssistance />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/continuity/dispute" element={<RouteMeta title="Continuity Dispute" description="Submit an Asset Safe continuity dispute request." path="/continuity/dispute"><ContinuityDispute /></RouteMeta>} />
        <Route path="/pricing" element={<Pricing />} />
          <Route path="/gift" element={<Gift />} />
          <Route path="/gift-checkout" element={<GiftCheckout />} />
          <Route path="/gift-success" element={<RouteMeta title="Gift Purchase Complete" description="Your Asset Safe gift purchase is complete." path="/gift-success"><GiftSuccess /></RouteMeta>} />
          <Route path="/gift-claim" element={<RouteMeta title="Claim Asset Safe Gift" description="Claim an Asset Safe gift subscription." path="/gift-claim"><GiftClaim /></RouteMeta>} />
          <Route path="/redeem" element={<GiftRedeem />} />
        <Route path="/subscription-checkout" element={<RouteMeta title="Subscription Checkout" description="Complete your Asset Safe subscription checkout." path="/subscription-checkout"><SubscriptionCheckout /></RouteMeta>} />
        <Route path="/video-help" element={<VideoHelp />} />
        <Route path="/test-email" element={<RouteMeta title="Test Email" description="Internal Asset Safe email testing page." path="/test-email"><TestEmail /></RouteMeta>} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/home-inventory" element={<HomeInventory />} />
        <Route path="/renters" element={<Renters />} />
        <Route path="/landlords" element={<Landlords />} />
        <Route path="/small-business" element={<SmallBusiness />} />
        <Route path="/sample-dashboard" element={<SampleDashboard />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<RouteMeta title="Create Account" description="Create an Asset Safe account." path="/signup"><Signup /></RouteMeta>} />
        <Route path="/auth" element={<RouteMeta title="Sign In" description="Sign in to Asset Safe." path="/auth"><Auth /></RouteMeta>} />
        <Route path="/auth/continue" element={<RouteMeta title="Continue Sign In" description="Continue signing in to Asset Safe." path="/auth/continue"><AuthContinue /></RouteMeta>} />
        <Route path="/auth/callback" element={<RouteMeta title="Authentication Callback" description="Complete Asset Safe authentication." path="/auth/callback"><AuthCallback /></RouteMeta>} />
        <Route path="/auth/callback/*" element={<RouteMeta title="Authentication Callback" description="Complete Asset Safe authentication." path="/auth/callback"><AuthCallback /></RouteMeta>} />
        <Route path="/email-verification" element={<RouteMeta title="Email Verification" description="Verify your Asset Safe email address." path="/email-verification"><EmailVerification /></RouteMeta>} />
        <Route path="/verify-email" element={<RouteMeta title="Verify Email" description="Verify your Asset Safe email address." path="/verify-email"><VerifyEmail /></RouteMeta>} />
        <Route path="/confirm-email-change" element={<RouteMeta title="Confirm Email Change" description="Confirm your Asset Safe email address change." path="/confirm-email-change"><ConfirmEmailChange /></RouteMeta>} />
        <Route path="/forgot-password" element={<RouteMeta title="Reset Password" description="Reset your Asset Safe password." path="/forgot-password"><ForgotPassword /></RouteMeta>} />
        {/* TOTP-based 2FA is now used instead of phone verification */}
        <Route path="/complete-pricing" element={<RouteMeta title="Complete Pricing" description="Complete Asset Safe pricing setup." path="/complete-pricing"><CompletePricing /></RouteMeta>} />
        
        {/* Public FAQ route */}
        <Route path="/qa" element={<QA />} />
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Welcome page - public to allow unverified users to see it */}
        <Route path="/welcome" element={<RouteMeta title="Welcome" description="Welcome to Asset Safe." path="/welcome"><Welcome /></RouteMeta>} />
        <Route path="/welcome/create-password" element={<RouteMeta title="Create Password" description="Create your Asset Safe password." path="/welcome/create-password"><CreatePassword /></RouteMeta>} />
        <Route path="/onboarding" element={<RouteMeta title="Onboarding" description="Complete Asset Safe onboarding." path="/onboarding"><Onboarding /></RouteMeta>} />
        <Route path="/invite" element={<RouteMeta title="Accept Invite" description="Accept an Asset Safe invitation." path="/invite"><InviteLanding /></RouteMeta>} />
        
        {/* Protected routes */}
        <Route path="/subscription-success" element={<RouteMeta title="Subscription Complete" description="Your Asset Safe subscription is complete." path="/subscription-success"><SubscriptionSuccess /></RouteMeta>} />
        <Route path="/account" element={<RouteMeta title="Account Dashboard" description="Your Asset Safe account dashboard." path="/account"><ProtectedRoute><Account /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/properties" element={<RouteMeta title="Properties" description="Manage your Asset Safe property records." path="/account/properties"><ProtectedRoute><Properties /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/properties/new" element={<RouteMeta title="New Property" description="Add a property to Asset Safe." path="/account/properties/new"><ProtectedRoute><PropertyForm /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/properties/:propertyId/assets" element={<RouteMeta title="Property Assets" description="Manage property assets in Asset Safe." path="/account/properties"><ProtectedRoute><PropertyAllAssets /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/photos" element={<RouteMeta title="Photos" description="Manage Asset Safe photos." path="/account/photos"><ProtectedRoute><PhotoGallery /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/videos" element={<RouteMeta title="Videos" description="Manage Asset Safe videos." path="/account/videos"><ProtectedRoute><Videos /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/documents" element={<RouteMeta title="Documents" description="Manage Asset Safe documents." path="/account/documents"><ProtectedRoute><Documents /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/cleanup" element={<RouteMeta title="Cleanup Queue" description="Review Asset Safe cleanup tasks." path="/account/cleanup"><ProtectedRoute><CleanupQueue /></ProtectedRoute></RouteMeta>} />

        <Route path="/account/media" element={<RouteMeta title="Media" description="Manage Asset Safe media." path="/account/media"><ProtectedRoute><CombinedMedia /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/media/upload" element={<RouteMeta title="Upload Media" description="Upload Asset Safe media." path="/account/media/upload"><ProtectedRoute><CombinedMediaUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/media/:id/edit" element={<RouteMeta title="Edit Media" description="Edit Asset Safe media." path="/account/media"><ProtectedRoute><MediaEdit /></ProtectedRoute></RouteMeta>} />
        
        <Route path="/account/insurance" element={<RouteMeta title="Insurance" description="Manage Asset Safe insurance records." path="/account/insurance"><ProtectedRoute><Insurance /></ProtectedRoute></RouteMeta>} />
        <Route path="/inventory" element={<RouteMeta title="Inventory" description="Manage Asset Safe inventory records." path="/inventory"><ProtectedRoute><Inventory /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/photos/upload" element={<RouteMeta title="Upload Photos" description="Upload photos to Asset Safe." path="/account/photos/upload"><ProtectedRoute><PhotoUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/videos/upload" element={<RouteMeta title="Upload Videos" description="Upload videos to Asset Safe." path="/account/videos/upload"><ProtectedRoute><VideoUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/documents/upload" element={<RouteMeta title="Upload Documents" description="Upload documents to Asset Safe." path="/account/documents/upload"><ProtectedRoute><DocumentUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/damage/photos/upload" element={<RouteMeta title="Upload Damage Photos" description="Upload damage photos to Asset Safe." path="/damage/photos/upload"><ProtectedRoute><DamagePhotoUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/damage/videos/upload" element={<RouteMeta title="Upload Damage Videos" description="Upload damage videos to Asset Safe." path="/damage/videos/upload"><ProtectedRoute><DamageVideoUpload /></ProtectedRoute></RouteMeta>} />
        
        <Route path="/account/insurance/new" element={<RouteMeta title="New Insurance Record" description="Add an insurance record to Asset Safe." path="/account/insurance/new"><ProtectedRoute><InsuranceForm /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/insurance/:id" element={<RouteMeta title="Insurance Record" description="View an Asset Safe insurance record." path="/account/insurance"><ProtectedRoute><InsuranceDetail /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/insurance/:id/edit" element={<RouteMeta title="Edit Insurance Record" description="Edit an Asset Safe insurance record." path="/account/insurance"><ProtectedRoute><InsuranceEdit /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/documents/:id/edit" element={<RouteMeta title="Edit Document" description="Edit an Asset Safe document." path="/account/documents"><ProtectedRoute><DocumentEdit /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/memory-safe/upload" element={<RouteMeta title="Upload Memory" description="Upload a memory to Asset Safe." path="/account/memory-safe/upload"><ProtectedRoute><MemoryUpload /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/memory-safe/:id/edit" element={<RouteMeta title="Edit Memory" description="Edit an Asset Safe memory." path="/account/memory-safe"><ProtectedRoute><MemoryEdit /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/settings" element={<RouteMeta title="Account Settings" description="Manage Asset Safe account settings." path="/account/settings"><ProtectedRoute><AccountSettings /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/contacts" element={<RouteMeta title="Contacts" description="Manage Asset Safe contacts." path="/account/contacts"><ProtectedRoute><VIPContacts /></ProtectedRoute></RouteMeta>} />
        <Route path="/schedule-professional" element={<RouteMeta title="Schedule Professional" description="Schedule professional Asset Safe support." path="/schedule-professional"><ProtectedRoute><ScheduleProfessional /></ProtectedRoute></RouteMeta>} />
        <Route path="/feedback" element={<RouteMeta title="Feedback" description="Send feedback to Asset Safe." path="/feedback"><ProtectedRoute><Feedback /></ProtectedRoute></RouteMeta>} />
        <Route path="/account/activity" element={<RouteMeta title="Activity Log" description="Review Asset Safe account activity." path="/account/activity"><ProtectedRoute><ActivityLog /></ProtectedRoute></RouteMeta>} />
        
        <Route path="/claims" element={<Claims />} />
        <Route path="/industry-requirements" element={<IndustryRequirements />} />
        <Route path="/checklists" element={<RouteMeta title="Checklists" description="Use Asset Safe checklists." path="/checklists"><ProtectedRoute><Checklists /></ProtectedRoute></RouteMeta>} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/state-requirements" element={<StateRequirements />} />
        <Route path="/digital-documentation-guide" element={<DigitalDocumentationGuide />} />
        <Route path="/press-news" element={<Navigate to="/resources" replace />} />
        <Route path="/press-news/digital-documentation-guide" element={<Navigate to="/digital-documentation-guide" replace />} />
        <Route path="/photography-guide" element={<PhotographyGuide />} />
        
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        <Route path="/social-impact" element={<SocialImpact />} />
        <Route path="/legacy-locker-info" element={<LegacyLockerInfo />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/awareness-guide" element={<AwarenessGuide />} />
        <Route path="/asset-documentation" element={<AssetDocumentation />} />
        
        {/* Admin Routes with Nested Workspaces */}
        <Route path="/admin" element={<RouteMeta title="Admin" description="Asset Safe admin workspace." path="/admin"><AdminShell /></RouteMeta>}>
          <Route index element={null} /> {/* Will redirect based on role */}
          <Route path="owner" element={<AdminOwnerWorkspace />} />
          <Route path="dev" element={<AdminDevWorkspace />} />
        </Route>
        
        <Route path="/admin/crm" element={<RouteMeta title="CRM" description="Asset Safe CRM workspace." path="/admin/crm"><CRM /></RouteMeta>} />
        <Route path="/admin/compass-partnership" element={<RouteMeta title="Compass Partnership" description="Asset Safe partnership workspace." path="/admin/compass-partnership"><CompassPartnership /></RouteMeta>} />
        <Route path="/admin/home-improvement-partnership" element={<RouteMeta title="Home Improvement Partnership" description="Asset Safe partnership workspace." path="/admin/home-improvement-partnership"><HomeImprovementPartnership /></RouteMeta>} />
        <Route path="/admin/aha-partnership" element={<RouteMeta title="AHA Partnership" description="Asset Safe partnership workspace." path="/admin/aha-partnership"><AHAPartnership /></RouteMeta>} />
        <Route path="/admin/ara-partnership" element={<RouteMeta title="ARA Partnership" description="Asset Safe partnership workspace." path="/admin/ara-partnership"><ARAPartnership /></RouteMeta>} />
        <Route path="/admin/b2b-opportunities" element={<RouteMeta title="B2B Opportunities" description="Asset Safe partnership workspace." path="/admin/b2b-opportunities"><B2BOpportunities /></RouteMeta>} />
        <Route path="/admin/dev-partner-strategy" element={<RouteMeta title="Dev Partner Strategy" description="Asset Safe partnership workspace." path="/admin/dev-partner-strategy"><DevPartnerStrategy /></RouteMeta>} />
        <Route path="/admin/habitat-partnership" element={<RouteMeta title="Habitat Partnership" description="Asset Safe partnership workspace." path="/admin/habitat-partnership"><HabitatPartnership /></RouteMeta>} />
        <Route path="/admin/habitat-pilot" element={<RouteMeta title="Habitat Pilot" description="Asset Safe partnership workspace." path="/admin/habitat-pilot"><HabitatPilot /></RouteMeta>} />
        <Route path="/admin/enterprise" element={<RouteMeta title="Enterprise" description="Asset Safe enterprise workspace." path="/admin/enterprise"><EnterpriseWhiteLabel /></RouteMeta>} />
        <Route path="/admin/photographer-interest" element={<RouteMeta title="Photographer Interest" description="Asset Safe partnership workspace." path="/admin/photographer-interest"><PhotographerInterest /></RouteMeta>} />
        <Route path="/admin/lender-partnership" element={<RouteMeta title="Lender Partnership" description="Asset Safe partnership workspace." path="/admin/lender-partnership"><LenderPartnership /></RouteMeta>} />
        <Route path="/admin/dev-invite" element={<RouteMeta title="Developer Invite" description="Accept an Asset Safe developer invite." path="/admin/dev-invite"><DevInviteAccept /></RouteMeta>} />
        <Route path="/acknowledge-access" element={<RouteMeta title="Acknowledge Access" description="Acknowledge Asset Safe access." path="/acknowledge-access"><AcknowledgeAccess /></RouteMeta>} />
        <Route path="/delegate-vault" element={<RouteMeta title="Delegate Vault" description="Access delegated Asset Safe vault information." path="/delegate-vault"><DelegateVault /></RouteMeta>} />

        
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
                <AccountProvider>
                  <StepUpProvider>
                    <AppContent />
                    <IdleWarningDialog />
                    <CookieConsent />
                  </StepUpProvider>
                </AccountProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </TranslationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
