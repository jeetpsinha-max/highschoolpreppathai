import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { GlobalOnboarding } from "./components/GlobalOnboarding";
import { PageLoader } from "./components/PageLoader";

// Eagerly loaded — first paint
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Code-split everything else
const Schools                = lazy(() => import("./pages/Schools"));
const SchoolProfile          = lazy(() => import("./pages/SchoolProfile"));
const SchoolComparison       = lazy(() => import("./pages/SchoolComparison"));
const AITools                = lazy(() => import("./pages/AITools"));
const SchoolMatcher          = lazy(() => import("./pages/SchoolMatcher"));
const SchoolGenerator        = lazy(() => import("./pages/SchoolGenerator"));
const InterviewCoach         = lazy(() => import("./pages/InterviewCoach"));
const ImproveChances         = lazy(() => import("./pages/ImproveChances"));
const ApplicationAssistant   = lazy(() => import("./pages/ApplicationAssistant"));
const SSATPractice           = lazy(() => import("./pages/SSATPractice"));
const Dashboard              = lazy(() => import("./pages/Dashboard"));
const ParentDashboard        = lazy(() => import("./pages/ParentDashboard"));
const ParentLetterWriter     = lazy(() => import("./pages/ParentLetterWriter"));
const Documents              = lazy(() => import("./pages/Documents"));
const TimelinePlanner        = lazy(() => import("./pages/TimelinePlanner"));
const FinancialAidAdvisor    = lazy(() => import("./pages/FinancialAidAdvisor"));
const SchoolVisitPrep        = lazy(() => import("./pages/SchoolVisitPrep"));
const BulkEnhancement        = lazy(() => import("./pages/BulkEnhancement"));
const ImportSchools          = lazy(() => import("./pages/ImportSchools"));
const AdminStatus            = lazy(() => import("./pages/AdminStatus"));
const BetaForSchools         = lazy(() => import("./pages/BetaForSchools"));
const PilotProgram           = lazy(() => import("./pages/PilotProgram"));
const SportsRankings         = lazy(() => import("./pages/SportsRankings"));
const SportDetail            = lazy(() => import("./pages/SportDetail"));
const About                  = lazy(() => import("./pages/About"));
const Contact                = lazy(() => import("./pages/Contact"));
const SocialScripts          = lazy(() => import("./pages/SocialScripts"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalOnboarding />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<PageSuspense><About /></PageSuspense>} />
              <Route path="/contact" element={<PageSuspense><Contact /></PageSuspense>} />
              <Route path="/beta-for-schools" element={<PageSuspense><BetaForSchools /></PageSuspense>} />
              <Route path="/pilot-program" element={<PageSuspense><PilotProgram /></PageSuspense>} />

              {/* Schools */}
              <Route path="/schools" element={<PageSuspense><Schools /></PageSuspense>} />
              <Route path="/schools/:id" element={<PageSuspense><SchoolProfile /></PageSuspense>} />
              <Route path="/schools/compare" element={<PageSuspense><SchoolComparison /></PageSuspense>} />

              {/* Sports */}
              <Route path="/sports-rankings" element={<PageSuspense><SportsRankings /></PageSuspense>} />
              <Route path="/sports-rankings/:sport" element={<PageSuspense><SportDetail /></PageSuspense>} />

              {/* AI Tools */}
              <Route path="/ai-tools" element={<PageSuspense><AITools /></PageSuspense>} />
              <Route path="/ai-tools/school-matcher" element={<PageSuspense><SchoolMatcher /></PageSuspense>} />
              <Route path="/ai-tools/school-generator" element={<PageSuspense><SchoolGenerator /></PageSuspense>} />
              <Route path="/ai-tools/interview" element={<PageSuspense><InterviewCoach /></PageSuspense>} />
              <Route path="/ai-tools/improve-chances" element={<PageSuspense><ImproveChances /></PageSuspense>} />
              <Route path="/ai-tools/assistant" element={<PageSuspense><ApplicationAssistant /></PageSuspense>} />
              <Route path="/ai-tools/ssat" element={<PageSuspense><SSATPractice /></PageSuspense>} />
              <Route path="/ai-tools/social-scripts" element={<PageSuspense><SocialScripts /></PageSuspense>} />
              <Route path="/ai-tools/financial-aid" element={<PageSuspense><FinancialAidAdvisor /></PageSuspense>} />
              <Route path="/ai-tools/school-visit" element={<PageSuspense><SchoolVisitPrep /></PageSuspense>} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><PageSuspense><Dashboard /></PageSuspense></ProtectedRoute>} />
              <Route path="/parent-dashboard" element={<ProtectedRoute><PageSuspense><ParentDashboard /></PageSuspense></ProtectedRoute>} />
              <Route path="/parent-letter-writer" element={<ProtectedRoute><PageSuspense><ParentLetterWriter /></PageSuspense></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><PageSuspense><Documents /></PageSuspense></ProtectedRoute>} />
              <Route path="/timeline" element={<ProtectedRoute><PageSuspense><TimelinePlanner /></PageSuspense></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/status" element={<AdminRoute><PageSuspense><AdminStatus /></PageSuspense></AdminRoute>} />
              <Route path="/admin/import-schools" element={<AdminRoute><PageSuspense><ImportSchools /></PageSuspense></AdminRoute>} />
              <Route path="/admin/bulk-enhancement" element={<AdminRoute><PageSuspense><BulkEnhancement /></PageSuspense></AdminRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileBottomNav />
            <PWAInstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
