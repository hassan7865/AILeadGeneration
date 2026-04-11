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

export function useLead(leadId: string | null) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lead>>(`/leads/${leadId}`);
      return response.data.data;
    },
    enabled: Boolean(leadId),
  });
}

export function useQualifyLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      await apiClient.post(`/leads/${leadId}/qualify`);
    },
    onSuccess: async (_, leadId) => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });
}

export function useDisqualifyLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      await apiClient.post(`/leads/${leadId}/disqualify`);
    },
    onSuccess: async (_, leadId) => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      await apiClient.delete(`/leads/${leadId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
