import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Copy, Check, Instagram, Linkedin,
  Twitter, Video, RefreshCw, Zap
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type Platform = "instagram" | "linkedin" | "twitter" | "tiktok";
type Stage    = "researching" | "applied" | "interview" | "accepted" | "enrolled";

interface PlatformConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  charLimit: number;
  tone: string;
}

/* ─── Config ─────────────────────────────────────────────────── */
const PLATFORMS: Record<Platform, PlatformConfig> = {
  instagram: {
    label: "Instagram Caption",
    icon: Instagram,
    color: "text-pink-500",
    gradient: "from-pink-500 to-rose-400",
    charLimit: 2200,
    tone: "authentic, visual, emoji-friendly, aspirational",
  },
  linkedin: {
    label: "LinkedIn Post",
    icon: Linkedin,
    color: "text-blue-600",
    gradient: "from-blue-600 to-blue-400",
    charLimit: 3000,
    tone: "professional, milestone-focused, network-appropriate, achievement-driven",
  },
  twitter: {
    label: "X / Twitter Thread",
    icon: Twitter,
    color: "text-sky-500",
    gradient: "from-sky-500 to-cyan-400",
    charLimit: 280,
    tone: "punchy, conversational, hook-first, 3-tweet thread format",
  },
  tiktok: {
    label: "TikTok Hook + Script",
    icon: Video,
    color: "text-red-500",
    gradient: "from-red-500 to-pink-400",
    charLimit: 300,
    tone: "ultra-viral, hook in first 2 seconds, POV-style, high energy",
  },
};

const STAGES: Record<Stage, string> = {
  researching: "Researching / Shortlisting",
  applied:     "Just Submitted My Application",
  interview:   "Preparing for / Completed Interview",
  accepted:    "Got Accepted! 🎉",
  enrolled:    "Committed / Enrolling",
};

/* ─── Script Generator Logic ─────────────────────────────────── */
function generateScript(
  school: string,
  platform: Platform,
  stage: Stage,
  personalNote: string
): string {
  const cfg = PLATFORMS[platform];
  const stageLabel = STAGES[stage];

  // Template engine per platform × stage
  const templates: Partial<Record<Platform, Partial<Record<Stage, string>>>> = {
    instagram: {
      accepted: `✨ I GOT IN. ✨\n\n${school} — I'm coming for you.\n\nThis moment has been years in the making. Countless prep sessions, interview practices, essay rewrites, and late nights. Today it all paid off.\n\n${personalNote ? `${personalNote}\n\n` : ""}To every student still in the process: keep going. Your school is out there. 🎓\n\n#PrivateSchool #Accepted #${school.replace(/\s/g, "")} #ClassOf2029 #PrepPath`,
      applied: `📬 Application submitted to ${school}.\n\nNo more editing. No more second-guessing. It's out of my hands — and that feels incredible.\n\n${personalNote ? `${personalNote}\n\n` : ""}The wait begins. 🤞\n\n#ApplicationSeason #PrivateSchool #${school.replace(/\s/g, "")} #PrepPath`,
      researching: `On my list: ${school}.\n\nStarted deep-diving into schools and ${school} keeps coming up. The academics, campus culture, and athletics all check my boxes.\n\n${personalNote ? `${personalNote}\n\n` : ""}The research phase is actually exciting. ✍️\n\n#HighSchoolSearch #PrivateSchool #PrepPath`,
      interview: `Interview prep mode: ON. 🎙️\n\nHeading into my ${school} interview. Practiced 20+ questions, researched the school inside out, and I feel ready.\n\n${personalNote ? `${personalNote}\n\n` : ""}Big moment incoming. Fingers crossed! 🤞\n\n#Admissions #InterviewPrep #${school.replace(/\s/g, "")} #PrepPath`,
      enrolled: `It's official. I'm going to ${school}. 🏫\n\nDeposit submitted. Name on the roster. The next chapter starts now.\n\n${personalNote ? `${personalNote}\n\n` : ""}Class of [YEAR] — let's go. 💙\n\n#CommitmentDay #PrivateSchool #${school.replace(/\s/g, "")} #PrepPath`,
    },
    linkedin: {
      accepted: `I'm thrilled to share that I've been accepted to ${school}!\n\nThis milestone represents months of preparation — from researching hundreds of schools, to essay drafts, to interview practice. Every step was intentional.\n\n${personalNote ? `${personalNote}\n\n` : ""}To fellow students navigating the private high school admissions process: the effort compounds. Stay focused, be authentic, and trust the process.\n\nGrateful for everyone who supported this journey. Excited for what comes next. 🎓\n\n#PrivateSchoolAdmissions #Accepted #${school.replace(/\s/g, "")} #HighSchool`,
      applied: `Application submitted to ${school} — a significant milestone in my high school admissions journey.\n\nApplying to selective schools requires more than good grades. It demands self-awareness, research, and clear articulation of your goals and values.\n\n${personalNote ? `${personalNote}\n\n` : ""}Looking forward to what's ahead. The process itself has already taught me a great deal.\n\n#Admissions #HighSchool #${school.replace(/\s/g, "")}`,
      enrolled: `Excited to announce I've officially enrolled at ${school}!\n\n${personalNote ? `${personalNote}\n\n` : ""}Grateful for this opportunity and ready to contribute to the community.\n\n#Accepted #${school.replace(/\s/g, "")} #PrivateSchool`,
    },
    twitter: {
      accepted: `1/ I GOT INTO ${school.toUpperCase()}. 🎉\n\nThread on how I prepared ↓\n\n---\n\n2/ Used AI tools to shortlist schools, practice interviews, and craft essays tuned to each school's culture. PrepPath changed my approach completely.\n\n---\n\n3/ To everyone still waiting: keep going. Your acceptance is coming. 🤞 ${personalNote ? `\n\n${personalNote}` : ""}`,
      applied: `Just hit submit on my ${school} application.\n\nNow begins the hardest part: the wait.\n\n${personalNote ? personalNote : "Fingers crossed. 🤞"}`,
      researching: `Shortlisting boarding schools and ${school} is looking like a serious contender.\n\nAnyone have experience with their [PROGRAM/SPORT/DEPARTMENT]?\n\n${personalNote ? personalNote : ""}`,
      interview: `${school} interview in [X] days.\n\nPracticed 25 questions. Researched the school top to bottom. Ready.\n\n${personalNote ? personalNote : "Let's go. 🎙️"}`,
      enrolled: `Committed to ${school}. 🏫\n\nNo more deciding. Best chapter ahead.\n\n${personalNote ? personalNote : "Class of [YEAR]. Let's go."}`,
    },
    tiktok: {
      accepted: `POV: You just got into ${school} 🎉\n\n[Hook - show reaction]\nHere's what I did differently in my application...\n[Beat drop]\n• Used AI for school matching\n• Practiced 20+ interview Qs\n• Wrote essays for EACH school's culture\n\n${personalNote ? personalNote : "Your school is out there. Keep going."}\n\n#Accepted #${school.replace(/\s/g, "")} #PrivateSchool #PrepPath #fyp`,
      applied: `POV: You just submitted your ${school} application 📬\n\n[Hook: deep exhale]\nMonths of prep. Finally done.\n[Cut to essay doc closing]\n\n${personalNote ? personalNote : "Now we wait. 🤞"}\n\n#ApplicationSeason #PrivateSchool #fyp #PrepPath`,
      interview: `POV: Your ${school} interview is in 3 days 😤\n\n[Hook: intense study montage]\nHere's my prep list:\n✅ 25 mock questions\n✅ School research deep-dive\n✅ AI interview coach\n\n${personalNote ? personalNote : "We are SO ready."}\n\n#InterviewPrep #${school.replace(/\s/g, "")} #fyp #PrepPath`,
    },
  };

  const platformTemplates = templates[platform];
  if (platformTemplates) {
    const stageTemplate = platformTemplates[stage];
    if (stageTemplate) return stageTemplate;
  }

  // Fallback generic
  return `${stageLabel} at ${school}!\n\n${personalNote ? `${personalNote}\n\n` : ""}#${school.replace(/\s/g, "")} #PrepPath #PrivateSchool`;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function SocialScripts() {
  const { toast } = useToast();
  const [school, setSchool] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [stage, setStage] = useState<Stage>("accepted");
  const [personalNote, setPersonalNote] = useState("");
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const platformCfg = PLATFORMS[platform];

  const handleGenerate = () => {
    if (!school.trim()) {
      toast({ title: "Enter a school name", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const result = generateScript(school.trim(), platform, stage, personalNote);
      setScript(result);
      setGenerating(false);
      setCopied(false);
    }, 800);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2500);
  };

  const charCount = script.length;
  const charLimit = platformCfg.charLimit;
  const charOver  = charCount > charLimit;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden mesh-hero py-16">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-4 bg-teal-500/20 text-teal-200 border-teal-400/30">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI Script Generator
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Social Media Scripts
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            One-shot captions and scripts for every platform — tuned to your school and application stage.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* ── Inputs ── */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-foreground">Configure your script</h2>

                <div className="space-y-2">
                  <Label htmlFor="school-input">School Name</Label>
                  <Input
                    id="school-input"
                    placeholder="e.g. Phillips Andover, Exeter, Choate..."
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(PLATFORMS) as Platform[]).map((p) => {
                      const cfg = PLATFORMS[p];
                      const isSelected = platform === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? "border-secondary bg-accent text-accent-foreground shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-secondary/50 hover:text-foreground"
                          }`}
                        >
                          <cfg.icon className={`h-4 w-4 ${isSelected ? cfg.color : ""}`} />
                          {cfg.label.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Application Stage</Label>
                  <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STAGES) as Stage[]).map((s) => (
                        <SelectItem key={s} value={s}>{STAGES[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-note">
                    Personal Touch <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="personal-note"
                    placeholder="Add a personal detail, quote, or specific story to weave in..."
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    className="rounded-xl resize-none h-24"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl py-5 text-base shadow-lg shadow-secondary/20"
                >
                  {generating ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Generate Script</>
                  )}
                </Button>
              </div>

              {/* Platform info card */}
              <div className={`rounded-xl border border-border bg-gradient-to-br ${platformCfg.gradient} p-px shadow-sm`}>
                <div className="rounded-[11px] bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <platformCfg.icon className={`h-4 w-4 ${platformCfg.color}`} />
                    <span className="text-sm font-semibold text-foreground">{platformCfg.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Tone:</span> {platformCfg.tone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">Char limit:</span> {charLimit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Output ── */}
            <div className="flex flex-col">
              <div className="rounded-2xl border border-border bg-card shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <platformCfg.icon className={`h-4 w-4 ${platformCfg.color}`} />
                    <span className="text-sm font-semibold text-foreground">{platformCfg.label}</span>
                  </div>
                  {script && (
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${charOver ? "text-destructive" : "text-muted-foreground"}`}>
                        {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="gap-1.5 h-8 rounded-lg"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-5">
                  {!script ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
                      <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">Your script will appear here</p>
                        <p className="text-sm text-muted-foreground">
                          Fill in the inputs and click Generate Script
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="h-full min-h-[380px] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0 text-foreground"
                    />
                  )}
                </div>
              </div>

              {script && (
                <div className="mt-3 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-xl gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Script"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
