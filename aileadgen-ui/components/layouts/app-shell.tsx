"use client";

import { AutomationShell } from "@/components/layouts/automation-shell";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AutomationShell>{children}</AutomationShell>;
}
