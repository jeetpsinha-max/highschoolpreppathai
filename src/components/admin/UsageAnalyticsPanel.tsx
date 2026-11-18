import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users, Eye, Clock, RefreshCw, BarChart3, Globe, Download, Activity, Layers, AlertCircle, Smartphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/lib/utils";

interface SiteAnalytics {
  days: number;
  unique_visitors: number;
  page_views: number;
  sessions: number;
  signed_in_visitors: number;
  avg_session_sec: number;
  pages_per_session: number;
  active_now: number;
  prev_unique_visitors: number;
  daily: { date: string; visitors: number; views: number }[];
  top_pages: { path: string; views: number; visitors: number }[];
  top_referrers: { referrer: string; visitors: number }[];
  devices: { device_type: string; visitors: number }[];
  recent: {
    path: string;
    browser: string | null;
    os: string | null;
    device_type: string | null;
    created_at: string;
    signed_in: boolean;
  }[];
}

const RANGES = [7, 30, 90] as const;

function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function StatTile({
  label, value, sub, icon: Icon,
}: { label: string; value: string; sub?: React.ReactNode; icon: typeof Users }) {
  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
      <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
        <span>{label}</span>
        <Icon className="w-4 h-4 text-primary" aria-hidden />
      </div>
      <div className="text-2xl font-extrabold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export function UsageAnalyticsPanel() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["site-analytics", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_site_analytics", { _days: days });
      if (error) throw error;
      return data as unknown as SiteAnalytics;
    },
    refetchInterval: 60_000,
  });

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preppath-analytics-${days}d-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const change = data ? percentChange(data.unique_visitors, data.prev_unique_visitors) : null;
  const maxPageViews = data?.top_pages[0]?.views ?? 0;
  const totalDeviceVisitors = data?.devices.reduce((sum, d) => sum + d.visitors, 0) ?? 0;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-xl font-bold">Website Visitor Analytics</CardTitle>
            {data && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                {data.active_now} on site now
              </Badge>
            )}
          </div>
          <CardDescription>
            Real visits recorded by PrepPath's own tracker. Admin pages are not counted.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={days === r ? "secondary" : "ghost"}
                className="h-7 px-2.5 text-xs"
                aria-pressed={days === r}
                onClick={() => setDays(r)}
              >
                {r}d
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={!data}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Couldn't load analytics</AlertTitle>
            <AlertDescription>
              {getErrorMessage(error)}. Analytics are only visible to accounts with the admin role, and the
              <code className="mx-1">page_views</code> database migration must be applied.
            </AlertDescription>
          </Alert>
        ) : isLoading || !data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-56 rounded-xl" />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatTile
                label="Unique Visitors"
                value={data.unique_visitors.toLocaleString()}
                icon={Users}
                sub={
                  change === null ? (
                    `Last ${data.days} days`
                  ) : (
                    <span className={change >= 0 ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-red-700 dark:text-red-400 font-medium"}>
                      {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs previous {data.days}d
                    </span>
                  )
                }
              />
              <StatTile
                label="Page Views"
                value={data.page_views.toLocaleString()}
                icon={Eye}
                sub={`${data.pages_per_session} pages / visit`}
              />
              <StatTile
                label="Visits"
                value={data.sessions.toLocaleString()}
                icon={Layers}
                sub={`${data.signed_in_visitors.toLocaleString()} signed-in users`}
              />
              <StatTile
                label="Avg. Visit Length"
                value={formatDuration(data.avg_session_sec)}
                icon={Clock}
                sub="First to last page in a visit"
              />
            </div>

            {/* Visitors per day */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" aria-hidden /> Unique visitors per day
              </h4>
              {data.page_views === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center border border-dashed rounded-xl">
                  No visits recorded yet. Data appears as soon as people open the site.
                </p>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.daily} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <defs>
                        <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(d: string) => format(parseISO(d), "MMM d")}
                        minTickGap={24}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "hsl(var(--popover-foreground))",
                        }}
                        labelFormatter={(d: string) => format(parseISO(d), "EEE, MMM d")}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name === "visitors" ? "Visitors" : "Page views"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#visitorsFill)"
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top pages */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-primary" aria-hidden /> Most visited pages
                </h4>
                {data.top_pages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No page views yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.top_pages.map((p) => (
                      <div key={p.path} className="space-y-1">
                        <div className="flex justify-between gap-3 text-xs font-medium">
                          <span className="truncate font-mono" title={p.path}>{p.path}</span>
                          <span className="text-muted-foreground tabular-nums shrink-0">
                            {p.views.toLocaleString()} views · {p.visitors.toLocaleString()} visitors
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${maxPageViews ? (p.views / maxPageViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent activity */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" aria-hidden /> Recent visitor activity
                </h4>
                {data.recent.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activity yet.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {data.recent.map((v, i) => (
                      <div key={`${v.created_at}-${i}`} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground font-mono truncate" title={v.path}>{v.path}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {[v.browser, v.os, v.device_type].filter(Boolean).join(" · ") || "Unknown device"}
                            {v.signed_in && " · signed in"}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referrers */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" aria-hidden /> Where visitors come from
                </h4>
                {data.top_referrers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No outside referrers yet (direct visits and bookmarks aren't listed).</p>
                ) : (
                  <ul className="space-y-1.5 text-xs">
                    {data.top_referrers.map((r) => (
                      <li key={r.referrer} className="flex justify-between gap-3">
                        <span className="truncate">{r.referrer}</span>
                        <span className="text-muted-foreground tabular-nums">{r.visitors.toLocaleString()} visitors</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Devices */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-primary" aria-hidden /> Devices
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {data.devices.map((d) => (
                    <li key={d.device_type} className="flex justify-between gap-3 capitalize">
                      <span>{d.device_type}</span>
                      <span className="text-muted-foreground tabular-nums normal-case">
                        {d.visitors.toLocaleString()} ({totalDeviceVisitors ? Math.round((d.visitors / totalDeviceVisitors) * 100) : 0}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
