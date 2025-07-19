import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollToTop";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import CustomerSupportWidget from "@/components/CustomerSupportWidget";
import PasswordGate from "@/components/PasswordGate";

import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import QA from "./pages/QA";
import Welcome from "./pages/Welcome";
import Account from "./pages/Account";
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
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Protected routes */}
        <Route path="/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
        <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
        <Route path="/qa" element={<ProtectedRoute><QA /></ProtectedRoute>} />
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
        <Route path="/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/video-help" element={<ProtectedRoute><VideoHelp /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CustomerSupportWidget />
    </BrowserRouter>
  );
};

const App = () => {
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    // Check if user has already entered the correct password
    const accessGranted = localStorage.getItem('assetdocs-access');
    if (accessGranted === 'granted') {
      setHasAccess(true);
    }
  }, []);

  const handlePasswordCorrect = () => {
    setHasAccess(true);
  };

  if (!hasAccess) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PasswordGate onPasswordCorrect={handlePasswordCorrect} />
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
            <AppContent />
          </AuthProvider>
        </TranslationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
