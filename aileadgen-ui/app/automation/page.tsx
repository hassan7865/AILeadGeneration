"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Clock,
  ChevronDown,
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
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAutomationConfig, useUpdateAutomationConfig } from "@/hooks/use-automation";
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

function PeerToggle({
  id,
  defaultChecked,
  checked,
  onCheckedChange,
}: {
  id: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
}) {
  const isControlled = typeof checked === "boolean";
  return (
    <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        defaultChecked={isControlled ? undefined : defaultChecked}
        checked={isControlled ? checked : undefined}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
    </label>
  );
}

export default function AutomationPage() {
  const { data: config, isLoading } = useAutomationConfig();
  const updateConfig = useUpdateAutomationConfig();

  const [form, setForm] = useState<AutomationConfig | null>(null);
  const [newIndustry, setNewIndustry] = useState("");
  const [techInput, setTechInput] = useState("");
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
    await updateConfig.mutateAsync({
      ...currentForm,
      target_industries: currentForm.target_industries.map((v) => v.trim()).filter(Boolean),
      tech_stack: currentForm.tech_stack.map((v) => v.trim()).filter(Boolean),
    });
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
        <ListLoader rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
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
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target Industry</label>
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
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-primary/70 transition hover:bg-primary/15 hover:text-primary"
                        onClick={() => removeIndustry(idx)}
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
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
                    <button
                      type="button"
                      className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
                      onClick={addIndustry}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Company Size (Employees)
                  </label>
                  <span className="text-sm font-bold text-primary">{sizeLabel}</span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={1}
                    max={1000}
                    value={currentForm.company_size_max}
                    onChange={(e) =>
                      updateForm((prev) => ({ ...prev, company_size_max: Number(e.target.value) }))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary"
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
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Geography</label>
                  <div className="relative">
                    <select
                      value={currentForm.geography}
                      onChange={(e) => updateForm((prev) => ({ ...prev, geography: e.target.value }))}
                      className="w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="na">North America</option>
                      <option value="eu">Europe</option>
                      <option value="apac">Asia Pacific</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tech Stack</label>
                  <div className="rounded-xl border border-slate-200/70 bg-surface p-3">
                    <div className="flex flex-wrap gap-2">
                      {currentForm.tech_stack.map((t, idx) => (
                        <span
                          key={`${idx}-${t}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700"
                        >
                          {t}
                          <button
                            type="button"
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                            onClick={() => removeTech(idx)}
                            aria-label={`Remove ${t}`}
                          >
                            <X className="size-3" />
                          </button>
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
                      <button
                        type="button"
                        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
                        onClick={addTech}
                      >
                        Add
                      </button>
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
                <button
                  key={crm.key}
                  type="button"
                  className="group flex flex-col items-center justify-center space-y-4 rounded-xl border border-slate-100 p-6 transition-all hover:border-primary/40 hover:bg-primary/5"
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
                </button>
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
                  <PeerToggle
                    id={`source-${row.key}`}
                    checked={Boolean(currentForm.sources[row.key])}
                    onCheckedChange={(next) =>
                      updateForm((prev) => ({ ...prev, sources: { ...prev.sources, [row.key]: next } }))
                    }
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
                <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Daily Refresh</span>
                <PeerToggle
                  id="daily-refresh"
                  checked={currentForm.daily_refresh}
                  onCheckedChange={(next) => updateForm((prev) => ({ ...prev, daily_refresh: next }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Refresh Time</label>
                <div className="relative">
                  <Input
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
