"use client";

import { AppShell } from "@/components/layouts/app-shell";
import { InlineError } from "@/components/shared/inline-error";
import { ListLoader } from "@/components/shared/list-loader";
import {
  useIcpHealth,
  useInsightsSummary,
  useLeadQuality,
  useSignalEvents,
  useSignalSources,
} from "@/hooks/use-insights";
import { Briefcase, Filter, Network, TrendingUp, UserRoundSearch, UsersRound } from "lucide-react";
import { parseApiError } from "@/lib/api/error";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#004ac6", "#2563eb", "#b4c5ff", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9"];

function fmtPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  const rounded = Math.round(v * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins} MIN${mins === 1 ? "" : "S"} AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} HOUR${hrs === 1 ? "" : "S"} AGO`;
  const days = Math.floor(hrs / 24);
  return `${days} DAY${days === 1 ? "" : "S"} AGO`;
}

function heatStyles(heat: string): { tag: string; tagClass: string } {
  const h = heat.toUpperCase();
  if (h === "HOT") return { tag: "HOT", tagClass: "bg-green-500/15 text-green-700" };
  if (h === "WARM") return { tag: "WARM", tagClass: "bg-blue-500/15 text-blue-700" };
  return { tag: "COLD", tagClass: "bg-slate-100 text-slate-600" };
}

function iconForSignalType(st: string) {
  if (st === "funding_round") return <TrendingUp className="text-xl text-primary" />;
  if (st === "hiring_surge") return <Briefcase className="text-xl text-slate-400" />;
  if (st === "leadership_change") return <UserRoundSearch className="text-xl text-slate-400" />;
  return <Network className="text-xl text-slate-400" />;
}

export default function InsightsPage() {
  const { data: summary, isLoading: loadingSummary, isError: summaryError, error: summaryErrObj } = useInsightsSummary();
  const { data: quality, isLoading: loadingQuality, isError: qualityError, error: qualityErrObj } = useLeadQuality(30);
  const { data: sources, isLoading: loadingSources, isError: sourcesError, error: sourcesErrObj } = useSignalSources();
  const { data: icp, isLoading: loadingIcp, isError: icpError, error: icpErrObj } = useIcpHealth();
  const {
    data: signalEvents = [],
    isLoading: loadingEvents,
    isError: eventsError,
    error: eventsErrObj,
  } = useSignalEvents(20);

  if (loadingSummary || loadingQuality || loadingSources || loadingIcp || loadingEvents) {
    return (
      <AppShell>
        <div className="p-8">
          <ListLoader rows={10} />
        </div>
      </AppShell>
    );
  }
  const queryError = summaryError
    ? parseApiError(summaryErrObj).message
    : qualityError
      ? parseApiError(qualityErrObj).message
      : sourcesError
        ? parseApiError(sourcesErrObj).message
        : icpError
          ? parseApiError(icpErrObj).message
          : eventsError
            ? parseApiError(eventsErrObj).message
            : null;

  const sourceEntries = Object.entries(sources ?? {});
  const segmentEntries = Object.entries(icp?.segments ?? {});
  const matchAvgPct = icp?.match_avg_pct ?? 0;
  const pieData = segmentEntries.map(([name, value]) => ({ name, value }));

  const totalLeads = summary?.total_leads ?? 0;
  const qualified = summary?.qualified_count ?? 0;
  const avgScore = summary?.avg_score ?? 0;
  const pipeline = summary?.pipeline_value ?? 0;
  const avgLabel = summary?.avg_score_label ?? null;

  const chartData = quality ?? [];

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <InlineError message={queryError ?? undefined} />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-secondary">Intelligence Center</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface">Growth Insights</h2>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-surface-container-low p-1">
            <span className="rounded-md bg-white px-4 py-1.5 text-xs font-semibold shadow-sm">Last 30 Days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-lg bg-primary/5 p-2 text-primary">
                <UsersRound className="size-5" />
              </span>
              <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-600">
                <TrendingUp className="size-3.5" />
                {fmtPct(summary?.total_leads_change_pct)}
              </span>
            </div>
            <p className="text-sm font-medium text-secondary">Total Leads</p>
            <h3 className="mt-1 text-3xl font-extrabold text-on-surface">{totalLeads.toLocaleString()}</h3>
            <p className="mt-2 text-[10px] font-medium text-slate-400">VS PREVIOUS WEEK</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-lg bg-primary/5 p-2 text-primary">
                <UsersRound className="size-5" />
              </span>
              <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-600">
                <TrendingUp className="size-3.5" />
                {fmtPct(summary?.qualified_change_pct)}
              </span>
            </div>
            <p className="text-sm font-medium text-secondary">Qualified</p>
            <h3 className="mt-1 text-3xl font-extrabold text-on-surface">{qualified}</h3>
            <p className="mt-2 text-[10px] font-medium text-slate-400">VS PREVIOUS WEEK</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-lg bg-orange-500/5 p-2 text-tertiary">
                <Filter className="size-5" />
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                  avgLabel === "OPTIMAL" ? "bg-[#D97706]/15 text-[#D97706]" : "bg-slate-100 text-slate-600"
                }`}
              >
                {avgLabel ?? "—"}
              </span>
            </div>
            <p className="text-sm font-medium text-secondary">Avg ICP Score</p>
            <h3 className="mt-1 text-3xl font-extrabold text-on-surface">{Math.round(avgScore)}</h3>
            <p className="mt-2 text-[10px] font-medium text-slate-400">TARGET &gt; 70</p>
          </div>

          <div className="border-l-4 border-primary bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-lg bg-primary/5 p-2 text-primary">
                <TrendingUp className="size-5" />
              </span>
              <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-600">
                <TrendingUp className="size-3.5" />
                {fmtPct(summary?.pipeline_change_pct)}
              </span>
            </div>
            <p className="text-sm font-medium text-secondary">Pipeline Value</p>
            <h3 className="mt-1 text-3xl font-extrabold text-on-surface">${(pipeline / 1_000_000).toFixed(1)}M</h3>
            <p className="mt-2 text-[10px] font-medium text-slate-400">QUALIFIED × EST. DEAL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div className="col-span-12 rounded-xl bg-surface-container-lowest p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h4 className="text-lg font-bold tracking-tight">Lead Quality Over Time</h4>
                <p className="text-sm text-secondary">Daily leads and qualified (from your database)</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary-container" />
                  <span className="text-xs font-semibold">Total Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary-fixed-dim" />
                  <span className="text-xs font-semibold text-secondary">Qualified</span>
                </div>
              </div>
            </div>
            <div className="relative mt-4 h-[280px] w-full">
              {chartData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-secondary">No lead data in this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f2f3" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#004ac6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="qualified" name="Qualified" stroke="#b4c5ff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] xl:col-span-7 xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <h4 className="text-lg font-bold tracking-tight">Top Signal Sources</h4>
              <span className="text-xs font-bold text-secondary">Share of signals (%)</span>
            </div>
            <div className="space-y-6">
              {sourceEntries.length === 0 ? (
                <p className="text-sm text-secondary">No signals recorded yet.</p>
              ) : (
                sourceEntries.map(([name, value], idx) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">
                        {name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-on-surface">{value}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-low">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0
                            ? "bg-primary-container"
                            : idx === 1
                              ? "bg-primary-container/70"
                              : idx === 2
                                ? "bg-primary-container/40"
                                : "bg-primary-container/20"
                        }`}
                        style={{ width: `${Math.min(100, value)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] xl:col-span-5 xl:p-8">
            <h4 className="mb-8 text-lg font-bold tracking-tight">ICP Segment Health</h4>
            <div className="flex flex-col items-center">
              <div className="relative mb-8 h-52 w-full min-h-[208px]">
                {pieData.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-secondary">No segment data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={pieData[i].name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v ?? ""}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {pieData.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-on-surface">{matchAvgPct}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">Match Avg</span>
                  </div>
                )}
              </div>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
                {segmentEntries.map(([name, value], idx) => (
                  <div key={name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-xs font-semibold">{name.toUpperCase()}</span>
                    <span className="ml-auto text-xs font-bold text-slate-400">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h4 className="text-lg font-extrabold tracking-tight">Recent Signal Events</h4>
            <span className="text-sm text-secondary">
              {summary?.signals_last_7_days ?? 0} signals in the last 7 days
            </span>
          </div>
          <div className="relative space-y-3">
            {signalEvents.length === 0 ? (
              <p className="text-sm text-secondary">No signal events yet.</p>
            ) : (
              <>
                <div className="absolute bottom-4 left-[23px] top-4 w-0.5 bg-surface-container-high" />
                {signalEvents.map((ev) => {
                  const { tag, tagClass } = heatStyles(ev.heat);
                  return (
                    <div
                      key={ev.id}
                      className="relative flex flex-col gap-3 rounded-lg border border-surface-container bg-surface-container-lowest p-4 shadow-sm transition-transform hover:scale-[1.005] sm:flex-row sm:items-center sm:gap-6"
                    >
                      <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/10 bg-white shadow-sm">
                        {iconForSignalType(ev.signal_type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{ev.headline}</p>
                        <p className="mt-0.5 text-xs text-secondary">{ev.subtitle ?? ev.signal_type.replace("_", " ")}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="block text-[10px] font-bold text-secondary">{formatRelative(ev.detected_at)}</span>
                        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${tagClass}`}>{tag}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <footer className="mt-auto flex flex-col items-start gap-3 border-t border-outline-variant/10 p-6 text-[11px] font-medium text-slate-400 md:flex-row md:items-center md:justify-between md:p-8">
          <p>© 2026 LeadAgent AI Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              System Status
            </a>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
