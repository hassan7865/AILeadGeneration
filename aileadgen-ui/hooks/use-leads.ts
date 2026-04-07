"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Lead, LeadListItem, LeadStatus } from "@/types/api";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LeadListItem[]>>("/leads");
      return response.data.data;
    },
  });
}

export function useBulkUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: LeadStatus) => {
      await apiClient.patch("/leads/bulk", { status });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export interface CreateLeadPayload {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email?: string;
  notes?: string;
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeadPayload) => {
      const response = await apiClient.post<ApiResponse<Lead>>("/leads", payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
