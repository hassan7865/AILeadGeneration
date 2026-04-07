import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  withCredentials: true,
});

let isHandlingUnauthorized = false;

function clearClientSession() {
  if (typeof window === "undefined") return;
  sessionStorage.clear();
  localStorage.removeItem("auth_user");
}

async function handleUnauthorized() {
  if (typeof window === "undefined") return;
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore logout failures. We still force a local cleanup + redirect.
  } finally {
    clearClientSession();
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    isHandlingUnauthorized = false;
  }
}

apiClient.interceptors.request.use((config) => config);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await handleUnauthorized();
    }
    return Promise.reject(error);
  }
);
