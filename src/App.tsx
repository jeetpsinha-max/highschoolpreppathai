import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { GlobalOnboarding } from "./components/GlobalOnboarding";
import { PageLoader } from "./components/PageLoader";

// Eagerly loaded — first paint
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Code-split everything else (heavy, less common, or auth-gated)
const Schools = lazy(() => import("./pages/Schools"));
const SchoolProfile = lazy(() => import("./pages/SchoolProfile"));
const SchoolComparison = lazy(() => import("./pages/SchoolComparison"));
const AITools = lazy(() => import("./pages/AITools"));
const SchoolMatcher = lazy(() => import("./pages/SchoolMatcher"));
const SchoolGenerator = lazy(() => import("./pages/SchoolGenerator"));
const InterviewCoach = lazy(() => import("./pages/InterviewCoach"));
const ImproveChances = lazy(() => import("./pages/ImproveChances"));
const SSATPractice = lazy(() => import("./pages/SSATPractice"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ApplicationAssistant = lazy(() => import("./pages/ApplicationAssistant"));
const FinancialAidAdvisor = lazy(() => import("./pages/FinancialAidAdvisor"));
const SchoolVisitPrep = lazy(() => import("./pages/SchoolVisitPrep"));
const ParentLetterWriter = lazy(() => import("./pages/ParentLetterWriter"));
const TimelinePlanner = lazy(() => import("./pages/TimelinePlanner"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const BetaForSchools = lazy(() => import("./pages/BetaForSchools"));
const PilotProgram = lazy(() => import("./pages/PilotProgram"));
const Documents = lazy(() => import("./pages/Documents"));
const BulkEnhancement = lazy(() => import("./pages/BulkEnhancement"));
const AdminStatus = lazy(() => import("./pages/AdminStatus"));
const SportsRankings = lazy(() => import("./pages/SportsRankings"));
const SportDetail = lazy(() => import("./pages/SportDetail"));
const ImportSchools = lazy(() => import("./pages/ImportSchools"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Schools/sports data is mostly static — cache it aggressively
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 30 * 60 * 1000, // 30 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public marketing/info pages */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/beta" element={<BetaForSchools />} />
              <Route path="/pilot" element={<PilotProgram />} />

              {/* Browseable but better with auth — keep open so SEO + sharing work */}
              <Route path="/schools" element={<Schools />} />
              <Route path="/schools/:id" element={<SchoolProfile />} />
              <Route path="/sports-rankings" element={<SportsRankings />} />
              <Route path="/sports-rankings/:sport" element={<SportDetail />} />
              <Route path="/ai-tools" element={<AITools />} />

              {/* Auth-required */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
              <Route path="/schools/compare" element={<ProtectedRoute><SchoolComparison /></ProtectedRoute>} />
              <Route path="/ai-tools/school-matcher" element={<ProtectedRoute><SchoolMatcher /></ProtectedRoute>} />
              <Route path="/ai-tools/school-generator" element={<ProtectedRoute><SchoolGenerator /></ProtectedRoute>} />
              <Route path="/ai-tools/interview" element={<ProtectedRoute><InterviewCoach /></ProtectedRoute>} />
              <Route path="/ai-tools/improve" element={<ProtectedRoute><ImproveChances /></ProtectedRoute>} />
              <Route path="/ai-tools/ssat" element={<ProtectedRoute><SSATPractice /></ProtectedRoute>} />
              <Route path="/ai-tools/assistant" element={<ProtectedRoute><ApplicationAssistant /></ProtectedRoute>} />
              <Route path="/ai-tools/financial-aid" element={<ProtectedRoute><FinancialAidAdvisor /></ProtectedRoute>} />
              <Route path="/ai-tools/visit-prep" element={<ProtectedRoute><SchoolVisitPrep /></ProtectedRoute>} />
              <Route path="/ai-tools/parent-letters" element={<ProtectedRoute><ParentLetterWriter /></ProtectedRoute>} />
              <Route path="/ai-tools/timeline" element={<ProtectedRoute><TimelinePlanner /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/bulk-enhancement" element={<AdminRoute><BulkEnhancement /></AdminRoute>} />
              <Route path="/admin/status" element={<AdminRoute><AdminStatus /></AdminRoute>} />
              <Route path="/admin/import-schools" element={<AdminRoute><ImportSchools /></AdminRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <MobileBottomNav />
          <PWAInstallPrompt />
          <GlobalOnboarding />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
