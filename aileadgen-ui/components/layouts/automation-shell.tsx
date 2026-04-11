"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Plus,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";

import { initialsFromName, stringToAvatarClass } from "@/lib/avatar-styles";
import { cn } from "@/lib/utils";
import { useAuthMe } from "@/hooks/use-auth";
import { AddLeadDialog } from "@/components/features/leads/add-lead-dialog";
import { InlineError } from "@/components/shared/inline-error";
import { LeadSearchField } from "@/components/layouts/lead-search-field";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/error";
import { LeadSearchProvider } from "@/providers/lead-search-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems: { href: string; label: string; icon: React.ReactNode; activeClass?: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
  { href: "/insights", label: "Insights", icon: <LineChart className="size-5" /> },
  {
    href: "/automation",
    label: "Automation",
    icon: <Sparkles className="size-5" />,
    activeClass:
      "scale-[0.98] border-l-4 border-blue-600 bg-blue-600/10 font-semibold text-blue-400 active:opacity-80",
  },
];

function AutomationShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isError: meError, error: meErrObj } = useAuthMe();
  const [loggingOut, setLoggingOut] = useState(false);
  const onDashboard = pathname === "/dashboard";
  const displayName = me?.name?.trim() || me?.email || "Account";
  const avatarKey = me?.email ?? me?.name ?? "user";
  const avatarInitials = initialsFromName(me?.name?.trim() ? me.name : me?.email || "User");
  const roleLabel = me?.role === "admin" ? "Administrator" : "Member";

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await apiClient.post("/auth/logout");
    } finally {
      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  };

  const SidebarContent = (
    <>
      <div className="mb-10 px-6">
        <h1 className="text-xl font-bold tracking-tighter text-white">LeadAgent</h1>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">AI Lead Gen</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white",
                active &&
                  (item.href === "/automation"
                    ? item.activeClass
                    : "border-l-4 border-blue-600 bg-blue-600/10 text-blue-400")
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 pt-6">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition-colors outline-none",
                "text-white hover:bg-white/10",
                "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]",
                "data-[state=open]:bg-white/15"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  stringToAvatarClass(avatarKey)
                )}
                aria-hidden
              >
                {avatarInitials}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">{displayName}</p>
                <p className="truncate text-[10px] text-slate-400">{roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            sideOffset={10}
            alignOffset={0}
            collisionPadding={12}
            className="z-[200] w-[min(240px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl ring-1 ring-black/5"
          >
            <DropdownMenuLabel className="px-2 py-2 text-slate-900">
              <div className="space-y-0.5">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs font-normal text-slate-500">{me?.email ?? "—"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200" />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void onLogout()}
              disabled={loggingOut}
              className="mt-0.5 cursor-pointer gap-2 rounded-lg px-2 py-2.5 text-sm font-medium"
            >
              <LogOut className="size-4 shrink-0" />
              {loggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface text-on-surface antialiased">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[220px] flex-col bg-[#0F1117] py-6 font-sans text-sm tracking-tight antialiased shadow-2xl shadow-black/20 md:flex">
        {SidebarContent}
      </aside>

      <main className="min-h-screen flex-1 bg-surface md:ml-[220px]">
        <header className="sticky top-0 right-0 z-40 flex h-16 w-full items-center gap-3 bg-white/80 px-4 font-sans text-sm font-medium backdrop-blur-md md:px-8">
          <div className="flex shrink-0 items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] border-none bg-[#0F1117] p-0 text-white">
                <div className="flex h-full flex-col py-6">{SidebarContent}</div>
              </SheetContent>
            </Sheet>
          </div>
          {onDashboard ? (
            <LeadSearchField className="min-w-0 flex-1 md:max-w-lg" />
          ) : (
            <div className="hidden min-h-10 flex-1 md:block" aria-hidden />
          )}
          <div className="ml-auto flex shrink-0 items-center">
            <AddLeadDialog>
              <Button className="flex items-center gap-2 rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 active:scale-95 sm:px-4 sm:text-sm">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </Button>
            </AddLeadDialog>
          </div>
        </header>
        <div className="px-4 pt-4 md:px-8">
          <InlineError message={meError ? parseApiError(meErrObj).message : undefined} />
        </div>
        {children}
      </main>
    </div>
  );
}

export function AutomationShell({ children }: { children: React.ReactNode }) {
  return (
    <LeadSearchProvider>
      <AutomationShellLayout>{children}</AutomationShellLayout>
    </LeadSearchProvider>
  );
}
