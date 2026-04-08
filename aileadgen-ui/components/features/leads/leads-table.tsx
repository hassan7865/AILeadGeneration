"use client";

import { Archive, Eye, UserPlus } from "lucide-react";

import { InlineError } from "@/components/shared/inline-error";
import { ListLoader } from "@/components/shared/list-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLeads } from "@/hooks/use-leads";
import { parseApiError } from "@/lib/api/error";

export function LeadsTable() {
  const { data = [], isLoading, isError, error } = useLeads();
  const logoClassByCompany: Record<string, string> = {
    Stripe: "bg-indigo-500 text-white",
    Linear: "bg-black text-white",
    Notion: "border border-zinc-300 bg-zinc-200 text-black",
    Vercel: "bg-black text-white",
    Brex: "bg-orange-600 text-white",
    Ramp: "bg-teal-600 text-white",
    Gusto: "bg-pink-500 text-white",
    Loom: "bg-violet-600 text-white",
  };

  if (isLoading) {
    return <ListLoader rows={8} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
      <InlineError message={isError ? parseApiError(error).message : undefined} className="m-4 mb-0" />
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low/50">
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Company</TableHead>
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Contact Name</TableHead>
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Industry</TableHead>
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">ICP Score</TableHead>
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Signal</TableHead>
            <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">Status</TableHead>
            <TableHead className="px-6 py-4 text-right text-[10px] font-bold tracking-widest uppercase text-slate-500">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-outline-variant/5">
          {data.map((lead) => (
            <TableRow key={lead.id} className="group table-row-hover">
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold", logoClassByCompany[lead.company] ?? "bg-indigo-500 text-white")}>
                    {lead.company.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{lead.company}</span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-5 text-sm">{lead.contact_name}</TableCell>
              <TableCell className="px-6 py-5 text-sm text-slate-500">{lead.industry}</TableCell>
              <TableCell className="px-6 py-5">
                <Badge
                  className={cn(
                    "text-[11px] font-bold",
                    lead.icp_score >= 80
                      ? "bg-[#16A34A]/15 text-[#16A34A]"
                      : lead.icp_score >= 60
                        ? "bg-[#D97706]/15 text-[#D97706]"
                        : "bg-[#DC2626]/15 text-[#DC2626]"
                  )}
                  variant="secondary"
                >
                  {lead.icp_score}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-5">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{lead.signal}</span>
              </TableCell>
              <TableCell className="px-6 py-5">
                <span
                  className={cn(
                    "rounded px-2 py-1 text-[10px] font-bold uppercase",
                    lead.status === "qualified"
                      ? "bg-primary/10 text-primary"
                      : lead.status === "new"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  )}
                >
                  {lead.status}
                </span>
              </TableCell>
              <TableCell className="relative px-6 py-5 text-right">
                <span className="text-xs text-slate-400 group-hover:hidden">
                  {new Date(lead.added_at).toLocaleDateString()}
                </span>
                <div className="row-actions absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2 opacity-0">
                  <Button variant="ghost" size="icon-xs" className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-primary"><Eye className="size-4" /></Button>
                  <Button variant="ghost" size="icon-xs" className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-primary"><UserPlus className="size-4" /></Button>
                  <Button variant="ghost" size="icon-xs" className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-red-600"><Archive className="size-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                No leads found yet. Use Add Lead to create your first record.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      <div className="flex items-center justify-between bg-surface-container-low/30 px-6 py-4">
        <p className="text-xs text-slate-500">Showing <span className="font-bold text-on-surface">1-{Math.min(8, data.length)}</span> of {data.length} leads</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
