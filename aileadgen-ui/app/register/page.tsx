"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import { FieldErrorText, InlineError } from "@/components/shared/inline-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { parseApiError } from "@/lib/api/error";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await apiClient.post("/auth/register", { name, email, password });
      router.push("/dashboard");
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.16),transparent_40%),radial-gradient(circle_at_88%_82%,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8f9fa_55%,#f3f6ff_100%)] text-on-surface">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-tighter">LeadAgent</div>
          <div className="flex items-center gap-8">
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="link" className="h-auto px-2 text-sm font-normal text-slate-500" asChild>
                <a href="#">Support</a>
              </Button>
              <Button variant="link" className="h-auto px-2 text-sm font-normal text-slate-500" asChild>
                <a href="#">Documentation</a>
              </Button>
            </div>
            <Link href="/register" className="text-sm font-semibold text-blue-600">Sign Up</Link>
          </div>
        </div>
      </nav>
      <main className="flex flex-grow items-center justify-center px-4 pb-12 pt-24 md:px-6">
        <div className="grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
          <div className="hidden space-y-8 md:flex md:flex-col">
            <div className="space-y-4">
              <h1 className="text-[2.75rem] font-extrabold leading-tight tracking-tighter">Curating <span className="text-primary">Intelligence</span> for the modern B2B ecosystem.</h1>
              <p className="max-w-md text-on-surface-variant">Join LeadAgent to access premium lead enrichment and intent-based sorting. Our command center is designed for precision, not noise.</p>
            </div>
          </div>
          <Card className="relative overflow-hidden rounded-xl border border-blue-100/80 bg-white/90 shadow-[0px_20px_40px_rgba(25,28,29,0.08)] backdrop-blur">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />
            <CardHeader className="relative z-10 p-5 md:p-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
              <p className="text-sm text-on-surface-variant">Enter your professional details to begin curation.</p>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0 md:p-6 md:pt-0">
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Rivera" />
                  <FieldErrorText message={fieldErrors.name} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Work Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="alex@company.com" />
                  <FieldErrorText message={fieldErrors.email} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                  <FieldErrorText message={fieldErrors.password} />
                </div>
                <InlineError message={formError ?? undefined} />
                <LoadingButton type="submit" className="w-full py-4" loading={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </LoadingButton>
              </form>
              <p className="mt-8 border-t border-outline-variant/10 pt-8 text-center text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
