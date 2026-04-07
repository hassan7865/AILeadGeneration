"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Filter,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Plus,
  Search,
  Settings,
  Sparkles,
  LogOut,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthMe } from "@/hooks/use-auth";
import { AddLeadDialog } from "@/components/features/leads/add-lead-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SIDEBAR_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAF2bg9COxZqco_05not2WogofClYJakv0qynHlVxvwCtuo8p6wCpm3cLFIf8UVVwb2zB8vjzopl_5zkeiFhELHflwAD4tVHkqLxNtcJfeHewqZx3ZH3dgRvcBxNdd1z1NyJml2pLOgFA3Z5tpII0ghmCZnWImbQBe7xVwNarR1t8nQ9L3s62I-9PQQgNfWdzAjM0vEBdRWwjBr7ebrvC1lXa-QNeAJbDWNJg5FLbBZNu6Xssv8Ek9NVThhVbPha-6sFL4s1clgQoBi";

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

export function AutomationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useAuthMe();
  const [loggingOut, setLoggingOut] = useState(false);

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
        <Link
          href="#"
          className="flex items-center gap-3 px-6 py-3 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <Settings className="size-5" />
          <span>Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-6 py-3 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <HelpCircle className="size-5" />
          <span>Help</span>
        </Link>
      </nav>
      <div className="mt-auto px-6 pt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SIDEBAR_AVATAR} alt="" className="size-8 rounded-full bg-slate-700 object-cover" />
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">{me?.name ?? "Alex Chen"}</p>
                <p className="truncate text-[10px] text-slate-500">Pro Account</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl border border-slate-200/80 bg-white p-2 shadow-xl">
            <DropdownMenuLabel className="px-2 py-2">
              <div className="space-y-0.5">
                <p className="truncate text-sm font-semibold text-slate-900">{me?.name ?? "Account"}</p>
                <p className="truncate text-xs text-slate-500">{me?.email ?? "No email"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void onLogout()}
              disabled={loggingOut}
              className="mt-1 flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-1 size-4" />
              {loggingOut ? "Logging out..." : "Logout"}
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
        <header className="sticky top-0 right-0 z-40 flex h-16 w-full items-center justify-between bg-white/80 px-4 font-sans text-sm font-medium backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 md:hidden">
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
          <div className="hidden w-full max-w-md items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 md:flex">
            <Search className="mr-2 size-4 shrink-0 text-slate-400" aria-hidden />
            <Input
              className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none ring-0 placeholder:text-slate-400 focus-visible:ring-0"
              placeholder="Search automation workflows..."
            />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="hidden rounded-full text-slate-500 hover:bg-slate-100 sm:inline-flex">
              <Filter className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500 hover:bg-slate-100">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-error" />
            </Button>
            <div className="mx-1 hidden h-6 w-[1px] bg-outline-variant/20 sm:block" />
            <AddLeadDialog>
              <Button className="flex items-center gap-2 rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 active:scale-95 sm:px-4 sm:text-sm">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </Button>
            </AddLeadDialog>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
