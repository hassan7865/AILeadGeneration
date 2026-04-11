"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useLeadSearch } from "@/providers/lead-search-provider";
import { cn } from "@/lib/utils";

export function LeadSearchField({ className }: { className?: string }) {
  const { query, setQuery } = useLeadSearch();

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 md:max-w-md",
        className
      )}
    >
      <Search className="mr-2 size-4 shrink-0 text-slate-400" aria-hidden />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search leads by company, contact, industry, signal…"
        aria-label="Search leads"
        className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none ring-0 placeholder:text-slate-400 focus-visible:ring-0"
      />
    </div>
  );
}
