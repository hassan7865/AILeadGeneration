import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-surface px-6 py-12 text-on-surface">
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        ← Back to app
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">System status</h1>
      <p className="mt-3 text-sm font-medium text-emerald-700">All systems operational</p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        API and app availability are monitored during development. Wire this page to your status provider (e.g. status
        page URL) when you go live.
      </p>
    </div>
  );
}
