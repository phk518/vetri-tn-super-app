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
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F172A] rounded-md shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Gateway Header */}
        <div className="bg-[#0F172A] p-8 text-center border-b-4 border-slate-800">
          <div className="w-12 h-12 bg-[#DC2626] rounded-md mx-auto mb-4 flex items-center justify-center text-white">
            <span className="text-2xl font-bold">🏛</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">
            STATE AUTHENTICATION GATEWAY
          </h1>
          <p className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-[0.15em] mt-1.5">
            VETRI TAMILNADU SUPER APP PORTAL
          </p>
        </div>

        {/* Gateway Body */}
        <div className="bg-white p-8">
          <div className="text-center mb-6">
             <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border border-[#DC2626] flex items-center justify-center text-[10px]">@</span>
                {isLogin ? "CITIZEN LOGIN" : "NEW CITIZEN REGISTRATION"}
             </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm text-center font-bold">
              ERROR: {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {isLogin ? "REGISTERED EMAIL ADDRESS" : "EMAIL ADDRESS"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none disabled:opacity-50 text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                SECURE PASSWORD
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none disabled:opacity-50 text-sm font-medium transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DC2626] hover:bg-[#991B1B] text-white py-3 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "AUTHENTICATING..." : isLogin ? "AUTHORIZE & ENTER →" : "REGISTER PROFILE →"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[9px] text-slate-400 font-bold hover:text-slate-800 uppercase tracking-widest transition-colors"
            >
              {isLogin ? "INITIALIZE NEW CITIZEN PROFILE" : "RETURN TO CITIZEN LOGIN"}
            </button>
          </div>
        </div>
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">ESTABLISHING SECURE CONNECTION...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}