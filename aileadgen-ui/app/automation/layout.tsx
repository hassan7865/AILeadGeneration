import { AutomationShell } from "@/components/layouts/automation-shell";

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return <AutomationShell>{children}</AutomationShell>;
}
