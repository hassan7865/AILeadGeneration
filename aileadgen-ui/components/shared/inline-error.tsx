import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function InlineError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FieldErrorText({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return <p className={cn("text-xs font-medium text-red-600", className)}>{message}</p>;
}

