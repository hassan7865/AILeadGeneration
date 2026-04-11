import type { LeadListItem } from "@/types/api";

export type LeadSegmentFilter = "all" | "by_score" | "recent";

export function applyLeadSegment(leads: LeadListItem[], segment: LeadSegmentFilter): LeadListItem[] {
  const copy = [...leads];
  if (segment === "by_score") {
    copy.sort((a, b) => b.icp_score - a.icp_score || new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  } else if (segment === "recent") {
    copy.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }
  return copy;
}
