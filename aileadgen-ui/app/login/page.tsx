"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole, Workflow } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("m.hassansiddiqui9245@gmail.com");
  const [password, setPassword] = useState("start@123");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/auth/login", { email, password });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,0.16),transparent_40%),radial-gradient(circle_at_90%_85%,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8f9fa_55%,#f3f6ff_100%)] text-on-surface">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-tighter text-slate-900">LeadAgent</div>
          <div className="flex items-center gap-6 text-sm">
            <button type="button" className="hidden text-slate-500 md:block">
              Support
            </button>
            <Link href="/register" className="font-semibold text-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 pb-12 pt-24 md:px-6">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <section className="hidden space-y-5 lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Workflow className="size-3.5" />
              AI-powered pipeline intelligence
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
              Close more deals with live lead signals.
            </h1>
            <p className="max-w-md text-slate-600">
              Track intent, automate scoring, and sync your pipeline from a single workspace built for growth teams.
            </p>
          </section>

          <Card className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-blue-100/80 bg-white/90 shadow-[0px_20px_40px_rgba(25,28,29,0.08)] backdrop-blur">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />
            <CardHeader className="relative z-10 p-5 md:p-6">
              <CardTitle className="font-bold tracking-tight">Welcome back</CardTitle>
              <p className="text-sm text-on-surface-variant">Sign in to continue to your lead workspace.</p>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0 md:p-6 md:pt-0">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
                    Work Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
                      Password
                    </Label>
                    <Button variant="link" className="h-auto p-0 text-[13px]">
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </div>
                <LoadingButton type="submit" className="h-10 w-full text-sm font-semibold" loading={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </LoadingButton>
              </form>
              <p className="mt-8 border-t border-outline-variant/10 pt-8 text-center text-sm text-on-surface-variant">
                Do not have an account?{" "}
                <Link href="/register" className="font-bold text-primary hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
