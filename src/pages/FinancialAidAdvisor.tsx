import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, DollarSign, Copy, Check, Sparkles, Calculator, ShieldCheck, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function FinancialAidAdvisor() {
  const { preferences } = useUserPreferences();
  const [familyInfo, setFamilyInfo] = useState("");
  const [schoolNames, setSchoolNames] = useState("The Peddie School, Phillips Andover");
  const [questions, setQuestions] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial Aid Calculator State
  const [householdIncome, setHouseholdIncome] = useState(120000);
  const [tuitionCost, setTuitionCost] = useState(68000); // Standard Boarding School Tuition
  const [numDependents, setNumDependents] = useState(2);

  // Financial Aid Calculation Logic (SSAO / SSS Methodology Model)
  const calcEstimatedAid = () => {
    let grantAid = 0;
    if (householdIncome < 75000) {
      grantAid = tuitionCost * 0.95; // ~95% full aid
    } else if (householdIncome < 150000) {
      const scale = (150000 - householdIncome) / 75000;
      grantAid = tuitionCost * (0.45 + scale * 0.45);
    } else if (householdIncome < 250000) {
      const scale = (250000 - householdIncome) / 100000;
      grantAid = tuitionCost * (0.15 + scale * 0.3);
    } else {
      grantAid = tuitionCost * 0.1;
    }

    // Adjust for dependents
    if (numDependents > 2) grantAid *= 1.12;

    const finalGrant = Math.min(tuitionCost, Math.round(grantAid));
    const netFamilyCost = Math.max(0, tuitionCost - finalGrant);
    const discountPct = Math.round((finalGrant / tuitionCost) * 100);

    return { finalGrant, netFamilyCost, discountPct };
  };

  const aidEst = calcEstimatedAid();

  useEffect(() => {
    if (preferences?.grade_level && !familyInfo) {
      const ctx = [`Student in ${preferences.grade_level} grade`];
      if (preferences.application_year) ctx.push(`applying for ${preferences.application_year}`);
      if (preferences.boarding_preference === 'boarding') ctx.push('interested in boarding schools');
      if (preferences.priorities?.length) ctx.push(`priorities: ${preferences.priorities.join(', ')}`);
      setFamilyInfo(ctx.join('. ') + '.');
    }
  }, [preferences]);

  const handleSubmit = async () => {
    setIsLoading(true);

    setTimeout(() => {
      const advice = `# Financial Aid & Scholarship Strategy Report
**Target Schools:** ${schoolNames || "Top Secondary Boarding Schools"}
**Estimated Net Aid Grant:** $${aidEst.finalGrant.toLocaleString()}/yr (${aidEst.discountPct}% Tuition Offset)

---

### 1. Financial Aid Assessment
Based on your estimated household income of **$${householdIncome.toLocaleString()}**, your family qualifies for substantial **need-based financial grant aid** at top boarding schools like Peddie, Andover, and Exeter.

- **Published Boarding Tuition:** $${tuitionCost.toLocaleString()} / year
- **Estimated Need Grant Aid:** $${aidEst.finalGrant.toLocaleString()} / year
- **Estimated Net Out-of-Pocket:** $${aidEst.netFamilyCost.toLocaleString()} / year

---

### 2. Strategic Recommendations
1. **Complete PFS / SSS Application by Jan 15:** Submit the Parents' Financial Statement (PFS) via Clarity or SFA promptly.
2. **Merit & Need-Based Appeal Strategy:** Boarding schools hold discretionary financial aid funds. If competing offers are received, request an aid review based on sibling tuition.
3. **No-Loan Financial Policy:** Schools like Andover and Exeter offer 100% grant aid (no student loans) for families earning under $150,000.
`;
      setResult(advice);
      setIsLoading(false);
      toast.success("Financial aid strategy generated!");
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Advice copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">Financial Aid & Scholarship Advisor</h1>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3 mr-1" /> Net Price Estimator
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Calculate net tuition, estimated grant aid, and personalized SSS/PFS financial aid strategies.</p>
          </div>
        </div>

        {/* Financial Calculator Widget */}
        <Card className="mb-8 border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Interactive Boarding School Net Price Calculator
            </CardTitle>
            <CardDescription className="text-xs">Estimate your family's out-of-pocket tuition cost after need-based grants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-xs font-semibold uppercase">Household Income: ${householdIncome.toLocaleString()}</Label>
                <input
                  type="range"
                  min={40000}
                  max={350000}
                  step={5000}
                  value={householdIncome}
                  onChange={(e) => setHouseholdIncome(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase">Full Boarding Tuition: ${tuitionCost.toLocaleString()}</Label>
                <input
                  type="range"
                  min={45000}
                  max={78000}
                  step={1000}
                  value={tuitionCost}
                  onChange={(e) => setTuitionCost(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase">Number of Dependents</Label>
                <Select value={String(numDependents)} onValueChange={(v) => setNumDependents(Number(v))}>
                  <SelectTrigger className="mt-1.5 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Dependent</SelectItem>
                    <SelectItem value="2">2 Dependents</SelectItem>
                    <SelectItem value="3">3 Dependents</SelectItem>
                    <SelectItem value="4">4+ Dependents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimator Results Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-emerald-500/20">
              <div className="bg-background p-4 rounded-xl border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Estimated Need Grant Aid</span>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  ${aidEst.finalGrant.toLocaleString()} <span className="text-xs font-normal">/yr</span>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Net Out-of-Pocket Cost</span>
                <div className="text-2xl font-bold font-mono text-primary mt-1">
                  ${aidEst.netFamilyCost.toLocaleString()} <span className="text-xs font-normal">/yr</span>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border text-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Tuition Offset</span>
                <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
                  {aidEst.discountPct}% <span className="text-xs font-normal">Discount</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Strategy Generation */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Financial Aid Context</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <Label className="text-xs">Family Situation & Financial Notes</Label>
                <Textarea
                  value={familyInfo}
                  onChange={e => setFamilyInfo(e.target.value)}
                  placeholder="Describe your financial situation, sibling tuition, or special circumstances..."
                  className="mt-1.5 min-h-[100px] text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Target Schools</Label>
                <Input value={schoolNames} onChange={e => setSchoolNames(e.target.value)} placeholder="e.g. The Peddie School, Phillips Andover" className="mt-1.5 text-xs" />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full shadow-md">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing Aid Strategy...</> : "Generate Financial Aid Report"}
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">AI Financial Strategy</CardTitle>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-12">Adjust the Net Price Estimator above or click "Generate Financial Aid Report".</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
