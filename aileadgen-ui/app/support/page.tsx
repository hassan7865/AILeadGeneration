import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-surface px-6 py-12 text-on-surface">
      <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
        ← Sign in
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Support</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        For product questions or account issues, contact your workspace administrator or email your internal help desk.
        Enterprise customers should use the channel defined in your agreement.
      </p>
    </div>
  );
}
