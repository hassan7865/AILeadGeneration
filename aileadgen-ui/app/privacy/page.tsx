import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-surface px-6 py-12 text-on-surface">
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        ← Back to app
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        LeadAgent processes account and lead data you submit to provide pipeline intelligence. We use industry-standard
        transport security for API traffic. This placeholder policy will be replaced with your legal team’s version before
        production. Contact your workspace admin for data retention and deletion requests.
      </p>
    </div>
  );
}
