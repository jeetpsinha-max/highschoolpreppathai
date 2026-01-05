import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import About from "./pages/About";
import Contact from "./pages/Contact";
import BetaForSchools from "./pages/BetaForSchools";
import PilotProgram from "./pages/PilotProgram";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/schools/:id" element={<SchoolProfile />} />
            <Route path="/schools/compare" element={<SchoolComparison />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/ai-tools/school-matcher" element={<SchoolMatcher />} />
            <Route path="/ai-tools/school-generator" element={<SchoolGenerator />} />
            <Route path="/ai-tools/interview" element={<InterviewCoach />} />
            <Route path="/ai-tools/improve" element={<ImproveChances />} />
            <Route path="/ai-tools/ssat" element={<SSATPractice />} />
            <Route path="/ai-tools/assistant" element={<ApplicationAssistant />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/beta" element={<BetaForSchools />} />
            <Route path="/pilot" element={<PilotProgram />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
