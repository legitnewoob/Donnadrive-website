import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import BookDemo from "./pages/BookDemo";
import RouteOptimization from "./pages/RouteOptimization";
import SmartCalendar from "./pages/SmartCalendar";
import Portal from "./pages/Portal";
import VoiceFeedback from "./pages/VoiceFeedback";
import AIWhatsAppBooking from "./pages/AIWhatsAppBooking";
import ThankYou from "./pages/ThankYou";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Students from "./pages/Students";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import Payment from "./pages/Payment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/route-optimization" element={<RouteOptimization />} />
          <Route path="/smart-calendar" element={<SmartCalendar />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/voice-feedback" element={<VoiceFeedback />} />
          <Route path="/ai-whatsapp-booking" element={<AIWhatsAppBooking />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/get-onboard" element={<Onboarding />} />
          <Route path="/payment" element={<Payment/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/calendar" element={<Calendar/>}/>
          <Route path="/students" element={<Students/>}/>
          <Route path="/messages" element={<Messages/>}/>
          <Route path="/reports" element={<Reports/>}/>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
