"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Landed on after the user clicks the reset link in their email — the
// callback route (/auth/callback?next=/auth/reset-password) has already
// exchanged the code for a real (recovery) session by the time we get here.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setHasSession(!!data.session))
      .catch(() => setHasSession(false))
      .finally(() => setCheckingSession(false));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {checkingSession ? (
        <p className="text-sm text-zinc-400">Checking your reset link…</p>
      ) : !hasSession ? (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">Link invalid or expired</h1>
          <p className="text-sm text-zinc-400 mb-6">
            This password reset link is no longer valid. Request a new one from the sign-in menu.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold"
          >
            Back to 4UNI
          </button>
        </>
      ) : done ? (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">Password updated</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Your password has been changed. You're signed in with your new password.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold"
          >
            Continue to 4UNI
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white mb-2 text-left">Set a new password</h1>
          <p className="text-sm text-zinc-400 mb-6 text-left">Choose a new password for your account.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none"
            />
            {error && <p className="text-xs text-red-400 m-0">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-60 mt-1"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
