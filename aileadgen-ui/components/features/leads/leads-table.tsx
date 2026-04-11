"use client";

import { useMemo, useState } from "react";
import { Archive, CheckCircle, Eye } from "lucide-react";

import { LeadDetailDialog } from "@/components/features/leads/lead-detail-dialog";
import { InlineError } from "@/components/shared/inline-error";
import { ListLoader } from "@/components/shared/list-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisqualifyLead, useLeads, useQualifyLead } from "@/hooks/use-leads";
import { stringToAvatarClass } from "@/lib/avatar-styles";
import { applyLeadSegment, type LeadSegmentFilter } from "@/lib/lead-segment";
import { parseApiError } from "@/lib/api/error";
import { useLeadSearch } from "@/providers/lead-search-provider";
import type { LeadListItem } from "@/types/api";
import { cn } from "@/lib/utils";

function leadMatchesQuery(lead: LeadListItem, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    lead.company.toLowerCase().includes(s) ||
    lead.contact_name.toLowerCase().includes(s) ||
    lead.industry.toLowerCase().includes(s) ||
    lead.signal.toLowerCase().includes(s) ||
    lead.status.toLowerCase().includes(s) ||
    lead.source.toLowerCase().includes(s) ||
    String(lead.icp_score).includes(s)
  );
}

export type { LeadSegmentFilter };

type LeadsTableProps = {
  segment?: LeadSegmentFilter;
};

export function LeadsTable({ segment = "all" }: LeadsTableProps) {
  const { data = [], isLoading, isError, error } = useLeads();
  const { query } = useLeadSearch();
  const qualify = useQualifyLead();
  const disqualify = useDisqualifyLead();
  const [detailLead, setDetailLead] = useState<LeadListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rowActionError, setRowActionError] = useState<string | null>(null);

  const ordered = useMemo(() => applyLeadSegment(data, segment), [data, segment]);

  const filtered = useMemo(() => ordered.filter((lead) => leadMatchesQuery(lead, query)), [ordered, query]);

  const openDetail = (lead: LeadListItem) => {
    setDetailLead(lead);
    setDetailOpen(true);
  };

  const onQualifyRow = async (lead: LeadListItem) => {
    setRowActionError(null);
    try {
      await qualify.mutateAsync(lead.id);
    } catch (e) {
      setRowActionError(parseApiError(e).message);
    }
  };

  const onDisqualifyRow = async (lead: LeadListItem) => {
    setRowActionError(null);
    try {
      await disqualify.mutateAsync(lead.id);
    } catch (e) {
      setRowActionError(parseApiError(e).message);
    }
  };

  if (isLoading) {
    return <ListLoader rows={8} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
      <InlineError message={isError ? parseApiError(error).message : undefined} className="m-4 mb-0" />
      <InlineError message={rowActionError ?? undefined} className="m-4 mb-0 mt-2" />

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
            {filtered.map((lead) => {
              const rowBusy = qualify.isPending || disqualify.isPending;
              return (
                <TableRow key={lead.id} className="group table-row-hover">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                          stringToAvatarClass(lead.company)
                        )}
                      >
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
                    <div className="row-actions absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-primary"
                            onClick={() => openDetail(lead)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">View details</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-primary"
                            disabled={rowBusy || lead.status === "qualified"}
                            onClick={() => void onQualifyRow(lead)}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Mark qualified</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="rounded-lg text-slate-500 shadow-sm hover:bg-white hover:text-red-600"
                            disabled={rowBusy || lead.status === "disqualified"}
                            onClick={() => void onDisqualifyRow(lead)}
                          >
                            <Archive className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Disqualify</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && data.length > 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  No leads match your search. Try a different term or clear the search box.
                </TableCell>
              </TableRow>
            )}
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
        <p className="text-xs text-slate-500">
          {query.trim() ? (
            <>
              Showing <span className="font-bold text-on-surface">{filtered.length}</span> of {data.length} leads
              {filtered.length !== data.length ? " (search)" : ""}
            </>
          ) : (
            <>
              <span className="font-bold text-on-surface">{data.length}</span> lead{data.length === 1 ? "" : "s"} total
            </>
          )}
        </p>
      </div>

      <LeadDetailDialog
        lead={detailLead}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailLead(null);
        }}
      />
    </div>
  );
}
