
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import QA from "./pages/QA";
import Welcome from "./pages/Welcome";
import Account from "./pages/Account";
import PropertyForm from "./pages/PropertyForm";
import PhotoUpload from "./pages/PhotoUpload";
import VideoUpload from "./pages/VideoUpload";
import FloorPlanUpload from "./pages/FloorPlanUpload";
import InsuranceForm from "./pages/InsuranceForm";
import ScheduleProfessional from "./pages/ScheduleProfessional";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import Resources from "./pages/Resources";
import Feedback from "./pages/Feedback";
import VideoHelp from "./pages/VideoHelp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/qa" element={<QA />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/properties/new" element={<PropertyForm />} />
          <Route path="/account/photos/upload" element={<PhotoUpload />} />
          <Route path="/account/videos/upload" element={<VideoUpload />} />
          <Route path="/account/floorplans/upload" element={<FloorPlanUpload />} />
          <Route path="/account/insurance/new" element={<InsuranceForm />} />
          <Route path="/schedule-professional" element={<ScheduleProfessional />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/video-help" element={<VideoHelp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
