import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollToTop";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import CookieConsent from "@/components/CookieConsent";

import WelcomePage from "@/components/WelcomePage";

import Index from "./pages/Index";
import Features from "./pages/Features";
import Scenarios from "./pages/Scenarios";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
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
import FloorPlanUpload from "./pages/FloorPlanUpload";
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
import FloorPlans from "./pages/FloorPlans";
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
import AIValuationGuide from "./pages/AIValuationGuide";
import SocialImpact from "./pages/SocialImpact";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Auth />;
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
        <Route path="/auth" element={<Auth />} />
        <Route path="/features" element={<Features />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/subscription-checkout" element={<SubscriptionCheckout />} />
        <Route path="/video-help" element={<VideoHelp />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/sample-dashboard" element={<SampleDashboard />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Public FAQ route */}
        <Route path="/qa" element={<QA />} />
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Protected routes */}
        <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/account/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/account/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="/account/photos" element={<ProtectedRoute><PhotoGallery /></ProtectedRoute>} />
        <Route path="/photo-gallery" element={<ProtectedRoute><PhotoGallery /></ProtectedRoute>} />
        <Route path="/account/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
        <Route path="/account/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/account/floorplans" element={<ProtectedRoute><FloorPlans /></ProtectedRoute>} />
        <Route path="/account/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
        <Route path="/account/photos/upload" element={<ProtectedRoute><PhotoUpload /></ProtectedRoute>} />
        <Route path="/account/videos/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
        <Route path="/account/floorplans/upload" element={<ProtectedRoute><FloorPlanUpload /></ProtectedRoute>} />
        <Route path="/account/insurance/new" element={<ProtectedRoute><InsuranceForm /></ProtectedRoute>} />
        <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/schedule-professional" element={<ProtectedRoute><ScheduleProfessional /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        
        <Route path="/claims" element={<Claims />} />
        <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
        <Route path="/industry-requirements" element={<IndustryRequirements />} />
        <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/state-requirements" element={<StateRequirements />} />
        <Route path="/press-news" element={<PressNews />} />
        <Route path="/press-news/digital-documentation-guide" element={<PressNews />} />
        <Route path="/photography-guide" element={<PhotographyGuide />} />
        <Route path="/ai-valuation-guide" element={<AIValuationGuide />} />
        <Route path="/social-impact" element={<SocialImpact />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
    </BrowserRouter>
  );
};

const App = () => {
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    // Check current path and localStorage
    const currentPath = window.location.pathname;
    const accessGranted = localStorage.getItem('assetdocs-access');
    
    // Always show welcome page for root URL, otherwise check localStorage
    if (currentPath === '/' || currentPath === '') {
      setHasAccess(false);
    } else if (accessGranted === 'granted') {
      setHasAccess(true);
    }
  }, []);

  const handleEnterSite = () => {
    localStorage.setItem('assetdocs-access', 'granted');
    setHasAccess(true);
  };

  if (!hasAccess) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WelcomePage onEnterSite={handleEnterSite} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

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
