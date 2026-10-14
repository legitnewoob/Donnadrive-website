import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { isInstructorPage, isSuperAdmin } from "@/lib/access";
import { useEffect } from "react";
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
import Profile from "./pages/Profile";
import Learners from "./pages/Learners";
import LessonTypes from "./pages/LessonTypes";
import DonnaSettings from "./pages/DonnaSettings";
import Team from "./pages/Team";
import JoinSchool from "./pages/JoinSchool";
import PlanGate from "./components/PlanGate";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSales from "./pages/admin/AdminSales";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminNumbers from "./pages/admin/AdminNumbers";
import AdminAudit from "./pages/admin/AdminAudit";

const queryClient = new QueryClient();

function LogoutHandler() {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (params.get("action") === "logout") {
      localStorage.removeItem("dd_token");
      localStorage.removeItem("dd_access");
      localStorage.removeItem("dd_apiKey");
      window.dispatchEvent(new Event("dd_auth_change"));
      setParams({}, { replace: true });
    }
  }, [params, setParams]);
  return null;
}

// Instructor pages: super admins go to the admin panel (they aren't customers)
function AccessRedirect() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const check = () => {
      const { pathname: path, search: query } = window.location;
      if (!isInstructorPage(path, query)) return;
      if (isSuperAdmin()) navigate("/admin", { replace: true });
    };
    check();
    window.addEventListener("dd_auth_change", check);
    return () => window.removeEventListener("dd_auth_change", check);
  }, [pathname, search, navigate]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <LogoutHandler />
        <AccessRedirect />
        <PlanGate />
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
          <Route path="/learners" element={<Learners />} />
          <Route path="/lesson-types" element={<LessonTypes />} />
          <Route path="/settings" element={<DonnaSettings />} />
          <Route path="/team" element={<Team />} />
          <Route path="/join/:token" element={<JoinSchool />} />
          <Route path="/account" element={<Profile />} />
          {/* Donna Drive staff */}
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/sales" element={<AdminSales />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/numbers" element={<AdminNumbers />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
