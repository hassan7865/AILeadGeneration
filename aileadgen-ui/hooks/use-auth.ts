"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AuthUser } from "@/types/api";

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
      return response.data.data;
    },
  });
}
