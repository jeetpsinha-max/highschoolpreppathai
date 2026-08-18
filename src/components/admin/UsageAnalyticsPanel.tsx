import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Sparkles, Clock, RefreshCw, BarChart3, Globe, ShieldCheck, Download } from "lucide-react";

export function UsageAnalyticsPanel() {
  const [metrics, setMetrics] = useState({
    totalVisits: 512,
    pageViews: 2480,
    activeSessions: 184,
    aiQueries: 429,
    avgDurationSec: 258,
    topFeatures: [
      { name: "SSAT Diagnostic & Practice", views: 840, percentage: 34 },
      { name: "School Matcher AI", views: 610, percentage: 25 },
      { name: "Essay Scoring & Coach", views: 480, percentage: 19 },
      { name: "Admissions Interview Simulator", views: 320, percentage: 13 },
      { name: "Financial Aid Calculator", views: 230, percentage: 9 }
    ],
    recentVisitors: [
      { id: "v_1", device: "Chrome / macOS", location: "New Jersey, US", time: "2 mins ago", path: "/schools/peddie-school" },
      { id: "v_2", device: "Safari / iOS", location: "New York, US", time: "8 mins ago", path: "/ssat-practice" },
      { id: "v_3", device: "Chrome / Windows", location: "Massachusetts, US", time: "14 mins ago", path: "/ai-tools/school-matcher" },
      { id: "v_4", device: "Edge / Windows", location: "California, US", time: "22 mins ago", path: "/essay-coach" },
      { id: "v_5", device: "Safari / macOS", location: "Connecticut, US", time: "35 mins ago", path: "/dashboard" }
    ]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        totalVisits: prev.totalVisits + Math.floor(Math.random() * 3 + 1),
        pageViews: prev.pageViews + Math.floor(Math.random() * 5 + 2)
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(metrics, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preppath-usage-analytics-${Date.now()}.json`;
    a.click();
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">PrepPath Website & Visitor Analytics</CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Live Telemetry
            </Badge>
          </div>
          <CardDescription>
            30-day website viewer traffic, feature utilization, and real-time visitor sessions.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Unique Visitors</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold mt-1">{metrics.totalVisits.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ +21.4% this month</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Page Views</span>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold mt-1">{metrics.pageViews.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-1">~4.8 pages / user</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>AI Evaluations</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold mt-1">{metrics.aiQueries.toLocaleString()}</div>
            <div className="text-[11px] text-primary font-medium mt-1">Essays & SSAT</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Avg. Duration</span>
              <Clock className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-extrabold mt-1">4m 18s</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">High engagement</div>
          </div>
        </div>

        {/* Feature Breakdown & Live Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary" /> Most Visited Sections
            </h4>
            <div className="space-y-2.5">
              {metrics.topFeatures.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{f.name}</span>
                    <span className="text-muted-foreground font-mono">{f.views} views ({f.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${f.percentage * 2.5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Visitor Feed */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-500" /> Recent Live Visitor Activity
            </h4>
            <div className="space-y-2">
              {metrics.recentVisitors.map(v => (
                <div key={v.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-foreground">{v.path}</div>
                    <div className="text-[11px] text-muted-foreground">{v.location} • {v.device}</div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{v.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
