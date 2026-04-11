import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-surface px-6 py-12 text-on-surface">
      <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
        ← Back to app
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        By using LeadAgent you agree to use the product in compliance with applicable laws and your organization’s
        policies. Replace this summary with your executed terms. For enterprise agreements, consult your contract
        documentation.
      </p>
    </div>
  );
}
