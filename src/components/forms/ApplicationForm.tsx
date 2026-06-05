// src/components/forms/ApplicationForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_METADATA } from "@/lib/sla/constants";
import type { ServiceType } from "@/lib/supabase/types";

interface Props {
  serviceType: ServiceType;
}

export default function ApplicationForm({ serviceType }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const meta = SERVICE_METADATA[serviceType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          payload: formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to create application");

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="glass-card p-8 rounded-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{meta.icon}</div>
          <h1 className="text-2xl font-black text-slate-900">{meta.displayName}</h1>
          <p className="text-slate-500">{meta.displayNameTamil}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {meta.formFields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === "select" ? (
                <select
                  required={field.required}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "date" ? (
                <input
                  type="date"
                  required={field.required}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none"
                />
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none"
                />
              )}
              <p className="text-xs text-slate-400 mt-1">{field.labelTamil}</p>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tn-red text-white py-3 rounded-xl font-bold hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}