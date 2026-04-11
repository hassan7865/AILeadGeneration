import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-surface px-6 py-12 text-on-surface">
      <h1 className="text-2xl font-extrabold tracking-tight">Reset password</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Self-service password reset is not enabled for this workspace. Ask your administrator to reset your account or
        invite you again. If you use SSO, reset through your identity provider.
      </p>
      <Link href="/login" className="mt-8 text-sm font-semibold text-primary hover:underline">
        ← Back to sign in
      </Link>
    </div>
  );
}
