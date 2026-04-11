"use client";

import { useState } from "react";
import { BadgeCheck, Ban, Loader2, Trash2 } from "lucide-react";


import { InlineError } from "@/components/shared/inline-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  useDeleteLead,
  useDisqualifyLead,
  useLead,
  useQualifyLead,
} from "@/hooks/use-leads";
import { parseApiError } from "@/lib/api/error";
import type { LeadListItem } from "@/types/api";
import { cn } from "@/lib/utils";

type LeadDetailDialogProps = {
  lead: LeadListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadDetailDialog({ lead, open, onOpenChange }: LeadDetailDialogProps) {
  const leadId = open && lead ? lead.id : null;
  const { data: detail, isLoading: detailLoading, isError, error } = useLead(leadId);
  const qualify = useQualifyLead();
  const disqualify = useDisqualifyLead();
  const remove = useDeleteLead();
  const [actionError, setActionError] = useState<string | null>(null);

  const status = detail?.status ?? lead?.status ?? "new";
  const busy = qualify.isPending || disqualify.isPending || remove.isPending;

  const onQualify = async () => {
    if (!lead) return;
    setActionError(null);
    try {
      await qualify.mutateAsync(lead.id);
      onOpenChange(false);
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  const onDisqualify = async () => {
    if (!lead) return;
    setActionError(null);
    try {
      await disqualify.mutateAsync(lead.id);
      onOpenChange(false);
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  const onDelete = async () => {
    if (!lead) return;
    setActionError(null);
    try {
      await remove.mutateAsync(lead.id);
      onOpenChange(false);
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setActionError(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        {!lead ? null : (
          <>
        <DialogHeader>
          <DialogTitle className="text-lg">{lead.company}</DialogTitle>
          <DialogDescription className="text-left text-slate-600">
            {lead.contact_name} · {lead.industry}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Signal: {lead.signal}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Source: {lead.source}</span>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-bold uppercase",
                status === "qualified"
                  ? "bg-primary/10 text-primary"
                  : status === "disqualified"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-amber-100 text-amber-800"
              )}
            >
              {status}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">ICP score</span>
            <span className="text-lg font-bold text-on-surface">{lead.icp_score}</span>
          </div>
          {detailLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="size-3.5 animate-spin" />
              Loading details…
            </div>
          )}
          {isError && <InlineError message={parseApiError(error).message} />}
          {detail?.notes ? (
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-500">Notes</p>
              <p className="mt-1 rounded-lg bg-surface-container-low p-3 text-sm text-slate-700">{detail.notes}</p>
            </div>
          ) : null}
          {!detailLoading && detail && !detail.notes ? (
            <p className="text-xs text-slate-400">No notes on this lead.</p>
          ) : null}
        </div>

        <InlineError message={actionError ?? undefined} />

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex flex-wrap gap-2">
            <LoadingButton
              type="button"
              size="sm"
              className="gap-1.5"
              loading={qualify.isPending}
              disabled={busy || status === "qualified"}
              onClick={() => void onQualify()}
            >
              <BadgeCheck className="size-4" />
              Mark qualified
            </LoadingButton>
            <LoadingButton
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              loading={disqualify.isPending}
              disabled={busy || status === "disqualified"}
              onClick={() => void onDisqualify()}
            >
              <Ban className="size-4" />
              Disqualify
            </LoadingButton>
          </div>
          <LoadingButton
            type="button"
            variant="destructive"
            size="sm"
            className="self-start"
            disabled={busy}
            loading={remove.isPending}
            onClick={() => void onDelete()}
          >
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="size-4" />
              Delete lead
            </span>
          </LoadingButton>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
