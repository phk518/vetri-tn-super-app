// src/app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectedFrom);
      }
    };
    checkSession();
  }, [router, redirectedFrom]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.push(redirectedFrom);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setError(null);
        alert("Registration successful! Please check your email to confirm your account.");
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
          <h1 className="text-2xl font-black text-slate-900">Vetri Tamil Nadu</h1>
          <p className="text-tn-red text-sm font-bold uppercase tracking-widest">Super App Portal</p>
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
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="w-full mt-4 text-sm text-slate-500 font-medium hover:text-tn-red"
        >
          {isLogin ? "Need an account? Register" : "Have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}