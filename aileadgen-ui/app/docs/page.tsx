import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-surface px-6 py-12 text-on-surface">
      <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
        ← Sign in
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Documentation</h1>
      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-slate-600">
        <li>
          <Link className="font-medium text-primary hover:underline" href="/dashboard">
            Dashboard
          </Link>{" "}
          — manage leads and pipeline actions.
        </li>
        <li>
          <Link className="font-medium text-primary hover:underline" href="/insights">
            Insights
          </Link>{" "}
          — signal and ICP analytics.
        </li>
        <li>
          <Link className="font-medium text-primary hover:underline" href="/automation">
            Automation
          </Link>{" "}
          — ICP and sync settings.
        </li>
      </ul>
    </div>
  );
}
