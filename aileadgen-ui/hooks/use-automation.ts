"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AutomationConfig, AutomationRun } from "@/types/api";

export function useAutomationConfig() {
  return useQuery({
    queryKey: ["automation", "config"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AutomationConfig>>("/automation/config");
      return response.data.data;
    },
  });
}

export function useAutomationRuns() {
  return useQuery({
    queryKey: ["automation", "runs"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AutomationRun[]>>("/automation/runs");
      return response.data.data;
    },
  });
}

export function useUpdateAutomationConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AutomationConfig) => {
      const response = await apiClient.patch<ApiResponse<AutomationConfig>>("/automation/config", payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["automation", "config"] });
    },
  });
}
