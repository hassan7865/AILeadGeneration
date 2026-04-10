"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Clock,
  Database,
  Info,
  Network,
  Plus,
  Rocket,
  Share2,
  Target,
  X,
} from "lucide-react";

import { ListLoader } from "@/components/shared/list-loader";
import { InlineError } from "@/components/shared/inline-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAutomationConfig, useUpdateAutomationConfig } from "@/hooks/use-automation";
import { parseApiError } from "@/lib/api/error";
import type { AutomationConfig } from "@/types/api";

const HUBSPOT_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDoT-9oHTxoAYP2cZU6UCx2ypb9qtItYjnH7FYAGnIZPby-EE8GddEcm4DyFCmxz08cTNNSmiepMWKFAW32qJkGQ1HH8SLtnTv-DCqYKhW8D57gMncCem35gYoeaq_rcv-NUrVoX2sd_byCAPFWj7DmRgiWQCVdRB2xnnLVmJXz2vXHmKX7lqUGpzxuzNWFdkXj_Hdi7rNs1vzqbNaxoqahOWu_fIxWgrX3wvDniiloxWYP-87VHj7oHwh16JZI5Vd1tZQ7Q0NnWp13";

const SALESFORCE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiwxc7srR1ElXZaE9meKwC5sErAie827w9qc-OSC7v1YT-R2BDuLEJPaxcHup8P7lkYJVxSVHlhPNrC2_vqxGZvRPXpmZU7eHQ5NzbRwuGYN-NxArkjMEQ7kxT-8W7jPoapZ2Ns8KY1o0diwjBdI-ttGuDeCm7gl_e7fraJNAfTDWTbFVTaMJGD8kXxPfEYPzEHJi4tZ0S-VMzbbEAKWVv0UayzSgTJKuy-BBVqNoGB2sjfNyKn0d56J2gJuvC8cd9HWj_k2BCie8z";

const PIPEDRIVE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ1xvZ_U-OZvp6urNXL6RO0JotVGR3IxxoQRsxl6VOcexxQSlgXH82Rz6Z1oRS9mKdX4eAX89udFNgY_WPnN8uZ1M9qSQwPvXoF1S5ZzUCkAxrMtBn_S7dHbjvMUL4BOT3GKuKbilqduoa2REsHGZKRVnk2kyqJr_bV4ORARgWMJzYLIq_DFRo12-5pXtqvhPU3OO3MbboI5_friLoYfwO8HXTbI9dg9dmEBJPbMyUIjFMKrfVM9T2g4x17oQpq4ayzuK_0BazNyPk";

type SourceKey = "linkedin" | "crunchbase" | "apollo" | "jobboard";

const SOURCE_ROWS: { key: SourceKey; label: string; icon: React.ReactNode }[] = [
  { key: "linkedin", label: "LinkedIn", icon: <Share2 className="size-[20px] text-slate-400" /> },
  { key: "crunchbase", label: "Crunchbase", icon: <Database className="size-[20px] text-slate-400" /> },
  { key: "apollo", label: "Apollo", icon: <Rocket className="size-[20px] text-slate-400" /> },
  { key: "jobboard", label: "Job Boards", icon: <Briefcase className="size-[20px] text-slate-400" /> },
];

export default function AutomationPage() {
  const { data: config, isLoading, isError: configError, error: configErrObj } = useAutomationConfig();
  const updateConfig = useUpdateAutomationConfig();

  const [form, setForm] = useState<AutomationConfig | null>(null);
  const [newIndustry, setNewIndustry] = useState("");
  const [techInput, setTechInput] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const currentForm = form ?? config ?? null;

  const updateForm = (updater: (prev: AutomationConfig) => AutomationConfig) => {
    setForm((prev) => {
      const base = prev ?? config;
      if (!base) return prev;
      return updater(base);
    });
  };

  const sizeLabel = useMemo(() => {
    const max = currentForm?.company_size_max ?? 500;
    if (max < 50) return "1 – 50";
    if (max <= 500) return "50 – 500+";
    return "500 – 1000+";
  }, [currentForm?.company_size_max]);

  const onSave = async () => {
    if (!currentForm) return;
    setSaveError(null);
    try {
      await updateConfig.mutateAsync({
        ...currentForm,
        target_industries: currentForm.target_industries.map((v) => v.trim()).filter(Boolean),
        tech_stack: currentForm.tech_stack.map((v) => v.trim()).filter(Boolean),
      });
    } catch (error) {
      setSaveError(parseApiError(error).message);
    }
  };

  const updateIndustry = (index: number, value: string) => {
    updateForm((prev) => {
      const next = [...prev.target_industries];
      next[index] = value;
      return { ...prev, target_industries: next };
    });
  };

  const removeIndustry = (index: number) => {
    updateForm((prev) => {
      return { ...prev, target_industries: prev.target_industries.filter((_, i) => i !== index) };
    });
  };

  const addIndustry = () => {
    const value = newIndustry.trim();
    if (!value) return;
    updateForm((prev) => {
      return { ...prev, target_industries: [...prev.target_industries, value] };
    });
    setNewIndustry("");
  };

  const addTech = () => {
    const value = techInput.trim();
    if (!value) return;
    updateForm((prev) => {
      return { ...prev, tech_stack: [...prev.tech_stack, value] };
    });
    setTechInput("");
  };

  const removeTech = (index: number) => {
    updateForm((prev) => {
      return { ...prev, tech_stack: prev.tech_stack.filter((_, i) => i !== index) };
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        <ListLoader rows={10} />
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        <InlineError message={configError ? parseApiError(configErrObj).message : "Automation config unavailable."} />
        <ListLoader rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <InlineError message={configError ? parseApiError(configErrObj).message : undefined} />
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Automation Settings</h2>
        <p className="mt-2 font-medium text-slate-500">Fine-tune your Ideal Customer Profile and AI discovery engine.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <div className="col-span-12 space-y-8 md:col-span-8">
          <section className="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Target className="size-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-on-surface">ICP Definition</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target Industry</Label>
                <div className="rounded-xl border border-slate-200/70 bg-surface p-3">
                  <div className="flex flex-wrap gap-2.5">
                  {currentForm.target_industries.map((tag, idx) => (
                    <span
                      key={`${idx}-${tag}`}
                      className="group flex h-9 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 pr-1.5 shadow-sm"
                    >
                      <Input
                        value={tag}
                        onChange={(e) => updateIndustry(idx, e.target.value)}
                        className="h-7 min-w-[88px] max-w-[170px] !rounded-none !border-0 !bg-transparent p-0 text-sm font-semibold text-primary !shadow-none focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 rounded-full text-primary/70 hover:bg-primary/15 hover:text-primary"
                        onClick={() => removeIndustry(idx)}
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="size-3" />
                      </Button>
                    </span>
                  ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-surface-container-low px-3 py-1.5">
                    <Plus className="size-4 text-slate-500" />
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="Add industry"
                      className="h-8 w-full !rounded-none !border-0 !bg-transparent p-0 text-sm font-medium !shadow-none focus-visible:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIndustry();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="xs"
                      className="shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      onClick={addIndustry}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <Label htmlFor="company-size-slider" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Company Size (Employees)
                  </Label>
                  <span className="text-sm font-bold text-primary">{sizeLabel}</span>
                </div>
                <div className="relative pt-1">
                  <Slider
                    id="company-size-slider"
                    min={1}
                    max={1000}
                    step={1}
                    value={[currentForm.company_size_max]}
                    onValueChange={(v) => {
                      const next = v[0];
                      if (typeof next === "number") {
                        updateForm((prev) => ({ ...prev, company_size_max: next }));
                      }
                    }}
                    className="w-full cursor-pointer"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>1</span>
                    <span>100</span>
                    <span>500</span>
                    <span>1000+</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <Label htmlFor="automation-geography" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Geography
                  </Label>
                  <Select
                    value={currentForm.geography}
                    onValueChange={(value) => updateForm((prev) => ({ ...prev, geography: value }))}
                  >
                    <SelectTrigger
                      id="automation-geography"
                      className="h-auto w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm font-semibold shadow-none focus:ring-2 focus:ring-primary/20"
                    >
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="na">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="apac">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tech Stack</Label>
                  <div className="rounded-xl border border-slate-200/70 bg-surface p-3">
                    <div className="flex flex-wrap gap-2">
                      {currentForm.tech_stack.map((t, idx) => (
                        <span
                          key={`${idx}-${t}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700"
                        >
                          {t}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="size-5 shrink-0 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            onClick={() => removeTech(idx)}
                            aria-label={`Remove ${t}`}
                          >
                            <X className="size-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-surface-container-low px-3 py-1.5">
                      <Plus className="size-4 text-slate-500" />
                      <Input
                        className="!rounded-none !border-0 !bg-transparent p-0 text-sm font-medium !shadow-none focus-visible:ring-0"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTech();
                          }
                        }}
                        placeholder="Add technology"
                      />
                      <Button
                        type="button"
                        size="xs"
                        className="shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        onClick={addTech}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Network className="size-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-on-surface">CRM Connection</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { key: "hubspot", name: "HubSpot", src: HUBSPOT_IMG },
                { key: "salesforce", name: "Salesforce", src: SALESFORCE_IMG },
                { key: "pipedrive", name: "Pipedrive", src: PIPEDRIVE_IMG },
              ].map((crm) => (
                <Button
                  key={crm.key}
                  type="button"
                  variant="outline"
                  className="group h-auto min-h-[148px] w-full flex-col gap-4 rounded-xl border-slate-100 p-6 font-normal transition-all hover:border-primary/40 hover:bg-primary/5"
                  onClick={() =>
                    updateForm((prev) => ({
                      ...prev,
                      crm_connections: {
                        ...prev.crm_connections,
                        [crm.key]: !Boolean(prev.crm_connections[crm.key]),
                      },
                    }))
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={crm.src} className="h-10 w-10" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-primary">
                    {currentForm.crm_connections[crm.key] ? `Connected ${crm.name}` : `Connect ${crm.name}`}
                  </span>
                </Button>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-8 md:col-span-4">
          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <h3 className="text-sm font-bold text-on-surface">Data Sources</h3>
              <Info className="size-4 text-slate-400" aria-hidden />
            </div>
            <div className="space-y-4">
              {SOURCE_ROWS.map((row) => (
                <div key={row.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {row.icon}
                    <span className="text-sm font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <Switch
                    id={`source-${row.key}`}
                    checked={Boolean(currentForm.sources[row.key])}
                    onCheckedChange={(next) =>
                      updateForm((prev) => ({ ...prev, sources: { ...prev.sources, [row.key]: next } }))
                    }
                    aria-label={`${row.label} data source`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <h3 className="text-sm font-bold text-on-surface">Sync Schedule</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-refresh" className="cursor-pointer text-xs font-bold uppercase tracking-tight text-slate-500">
                  Daily Refresh
                </Label>
                <Switch
                  id="daily-refresh"
                  checked={currentForm.daily_refresh}
                  onCheckedChange={(next) => updateForm((prev) => ({ ...prev, daily_refresh: next }))}
                  aria-label="Daily refresh"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-time" className="text-[10px] font-bold uppercase text-slate-400">
                  Refresh Time
                </Label>
                <div className="relative">
                  <Input
                    id="refresh-time"
                    className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary/20"
                    value={currentForm.refresh_time}
                    onChange={(e) => updateForm((prev) => ({ ...prev, refresh_time: e.target.value }))}
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden />
                </div>
              </div>

              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                <p className="text-[11px] font-medium leading-relaxed text-primary-container">
                  AI agents will scan all sources and update your pipeline daily at the scheduled time.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <InlineError message={saveError ?? undefined} className="mb-3" />
            <LoadingButton
              type="button"
              className="w-full rounded-xl bg-primary-container py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              loading={updateConfig.isPending}
              onClick={() => void onSave()}
            >
              Save Automation Settings
            </LoadingButton>
            <p className="mt-4 text-center text-[10px] font-medium italic text-slate-400">
              Changes take effect in the next sync cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
