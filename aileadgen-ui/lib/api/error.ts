import axios from "axios";

export interface ApiUiError {
  message: string;
  status?: number;
  fieldErrors: Record<string, string>;
}

type ValidationDetail = {
  loc?: Array<string | number>;
  msg?: string;
};

function fromValidation(details: ValidationDetail[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of details) {
    const loc = Array.isArray(d.loc) ? d.loc : [];
    let key = "form";
    if (loc[0] === "body" || loc[0] === "query") {
      key = String(loc[1] ?? "form");
    }
    out[key] = d.msg ?? "Invalid value";
  }
  return out;
}

export function parseApiError(error: unknown): ApiUiError {
  if (!axios.isAxiosError(error)) {
    return { message: "Something went wrong. Please try again.", fieldErrors: {} };
  }

  const status = error.response?.status;
  const data = error.response?.data as
    | {
        detail?: string | ValidationDetail[];
        message?: string;
      }
    | undefined;

  if (typeof data?.detail === "string") {
    return { message: data.detail, status, fieldErrors: {} };
  }

  if (Array.isArray(data?.detail)) {
    const fieldErrors = fromValidation(data.detail);
    return {
      message: fieldErrors.form ?? "Please fix the highlighted fields.",
      status,
      fieldErrors,
    };
  }

  if (typeof data?.message === "string" && data.message.trim().length > 0) {
    return { message: data.message, status, fieldErrors: {} };
  }

  if (!error.response) {
    return { message: "Network error. Please check your connection.", fieldErrors: {} };
  }

  return { message: "Request failed. Please try again.", status, fieldErrors: {} };
}

