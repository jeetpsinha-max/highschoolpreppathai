import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Schools from "./pages/Schools";
import SchoolProfile from "./pages/SchoolProfile";
import SchoolComparison from "./pages/SchoolComparison";
import AITools from "./pages/AITools";
import SchoolMatcher from "./pages/SchoolMatcher";
import SchoolGenerator from "./pages/SchoolGenerator";
import InterviewCoach from "./pages/InterviewCoach";
import ImproveChances from "./pages/ImproveChances";
import SSATPractice from "./pages/SSATPractice";
import Dashboard from "./pages/Dashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ApplicationAssistant from "./pages/ApplicationAssistant";
import FinancialAidAdvisor from "./pages/FinancialAidAdvisor";
import SchoolVisitPrep from "./pages/SchoolVisitPrep";
import ParentLetterWriter from "./pages/ParentLetterWriter";
import TimelinePlanner from "./pages/TimelinePlanner";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BetaForSchools from "./pages/BetaForSchools";
import PilotProgram from "./pages/PilotProgram";
import Documents from "./pages/Documents";
import BulkEnhancement from "./pages/BulkEnhancement";
import AdminStatus from "./pages/AdminStatus";
import SportsRankings from "./pages/SportsRankings";
import SportDetail from "./pages/SportDetail";
import ImportSchools from "./pages/ImportSchools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
            <Route path="/schools/:id" element={<ProtectedRoute><SchoolProfile /></ProtectedRoute>} />
            <Route path="/schools/compare" element={<ProtectedRoute><SchoolComparison /></ProtectedRoute>} />
            <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
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
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/beta" element={<ProtectedRoute><BetaForSchools /></ProtectedRoute>} />
            <Route path="/pilot" element={<ProtectedRoute><PilotProgram /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/sports-rankings" element={<ProtectedRoute><SportsRankings /></ProtectedRoute>} />
            <Route path="/sports-rankings/:sport" element={<ProtectedRoute><SportDetail /></ProtectedRoute>} />
            <Route path="/admin/bulk-enhancement" element={<ProtectedRoute><BulkEnhancement /></ProtectedRoute>} />
            <Route path="/admin/status" element={<ProtectedRoute><AdminStatus /></ProtectedRoute>} />
            <Route path="/admin/import-schools" element={<ProtectedRoute><ImportSchools /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
