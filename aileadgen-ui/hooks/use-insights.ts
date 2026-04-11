"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  IcpHealthResponse,
  InsightsSummary,
  LeadQualityPoint,
  SignalEvent,
} from "@/types/api";

export function useInsightsSummary() {
  return useQuery({
    queryKey: ["insights", "summary"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<InsightsSummary>>("/insights/summary");
      return response.data.data;
    },
  });
}

export function useLeadQuality(days = 30) {
  return useQuery({
    queryKey: ["insights", "lead-quality", days],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LeadQualityPoint[]>>(
        `/insights/lead-quality?days=${days}`
      );
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useSignalSources() {
  return useQuery({
    queryKey: ["insights", "signal-sources"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Record<string, number>>>("/insights/signal-sources");
      return response.data.data;
    },
  });
}

export function useIcpHealth() {
  return useQuery({
    queryKey: ["insights", "icp-health"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<IcpHealthResponse>>("/insights/icp-health");
      return response.data.data;
    },
  });
}

export function useSignalEvents(limit = 20) {
  return useQuery({
    queryKey: ["insights", "signal-events", limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SignalEvent[]>>(
        `/insights/signal-events?limit=${limit}`
      );
      return response.data.data;
    },
  });
}
