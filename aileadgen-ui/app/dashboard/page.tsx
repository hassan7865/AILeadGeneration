"use client";

import { AppShell } from "@/components/layouts/app-shell";
import { LeadsTable } from "@/components/features/leads/leads-table";
import { Button } from "@/components/ui/button";
import { ListLoader } from "@/components/shared/list-loader";
import { useAutomationRuns } from "@/hooks/use-automation";
import { useInsightsSummary } from "@/hooks/use-insights";
import { Bot, ChartLine } from "lucide-react";

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useInsightsSummary();
  const { data: runs, isLoading: loadingRuns } = useAutomationRuns();

  if (loadingSummary || loadingRuns) {
    return (
      <AppShell>
        <ListLoader rows={8} />
      </AppShell>
    );
  }

  const totalLeads = summary?.total_leads ?? 0;
  const qualified = summary?.qualified_count ?? 0;
  const alignment = totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0;
  const latestRun = runs?.[runs.length - 1];
  const signalsWeek = summary?.signals_last_7_days ?? 0;

  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tighter text-on-surface md:text-3xl">Leads Pipeline</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and monitor your high-intent potential customers.</p>
          </div>
          <div className="flex w-full gap-2 rounded-xl bg-surface-container-low p-1 md:w-auto">
            <Button size="sm" className="rounded-lg bg-white text-primary shadow-sm">All Leads</Button>
            <Button size="sm" variant="ghost" className="rounded-lg text-slate-500">By Score</Button>
            <Button size="sm" variant="ghost" className="hidden rounded-lg text-slate-500 sm:inline-flex">Recently Added</Button>
          </div>
        </div>
        <LeadsTable />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6 lg:col-span-8">
            <div className="relative z-10">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Pipeline Intelligence</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-on-surface">{alignment}%</p>
                  <p className="text-xs text-slate-500">Avg. ICP Alignment</p>
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-green-600" style={{ width: `${alignment}%` }} />
                  </div>
                </div>
                <div className="space-y-1 sm:border-l sm:border-outline-variant/20 sm:pl-6">
                  <p className="text-3xl font-extrabold text-on-surface">{signalsWeek}</p>
                  <p className="text-xs text-slate-500">Signals (last 7 days)</p>
                  <p className="mt-2 text-[10px] font-bold text-primary">From live signal feed →</p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-outline-variant/20 sm:pl-6">
                  <p className="text-3xl font-extrabold text-on-surface">{totalLeads}</p>
                  <p className="text-xs text-slate-500">Addressable TAM</p>
                  <p className="mt-2 text-[10px] text-slate-400">Market: Live database</p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-5">
              <ChartLine className="size-[120px]" />
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 text-white lg:col-span-4">
            <div className="mb-6 flex items-start justify-between">
              <div className="rounded-lg bg-white/10 p-2">
                <Bot className="size-4" />
              </div>
              <span className="rounded bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Active Agent</span>
            </div>
            <h4 className="mb-2 text-lg font-bold leading-tight">Automated Prospecting Status</h4>
            <p className="mb-6 text-xs text-indigo-200">
              Latest run: {latestRun?.status ?? "not_started"}. Qualified leads: {qualified}.
            </p>
            <Button className="w-full rounded-lg bg-white py-2.5 text-xs font-bold text-indigo-900 hover:bg-indigo-50">View Recommendations</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
