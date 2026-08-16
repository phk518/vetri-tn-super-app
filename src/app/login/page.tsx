// src/app/login/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// useSearchParams() must be inside a component wrapped by <Suspense>.
// Split into LoginContent (reads params) + LoginPage (provides the boundary).
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Session check is now handled by proxy.ts middleware. 
    // If the user is logged in, proxy.ts will automatically redirect them away from /login.
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        router.push(redirectedFrom);
        router.refresh();
      } else {
        alert("Registration successful! You can now sign in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-black text-slate-900">Vetri Tamil Nadu</h1>
          <p className="text-tn-red text-sm font-bold uppercase tracking-widest mt-1">
            Super App Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50"
            />
            {!isLogin && (
              <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tn-red text-white py-3 rounded-xl font-bold hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
          className="w-full mt-4 text-sm text-slate-500 font-medium hover:text-tn-red transition-colors"
        >
          {isLogin ? "Need an account? Register" : "Have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}

// Default export wraps the component that uses useSearchParams() in Suspense.
// This is required by Next.js App Router for static page generation.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-400 text-sm font-medium animate-pulse">Loading…</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}