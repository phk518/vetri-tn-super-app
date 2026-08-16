// src/app/settings/page.tsx
"use client";
import { useState, useEffect } from "react";

import SLACountdownCard from "@/layers/1_Presentation/SLACountdownCard";
import type { AuditEventStructure } from "@/layers/6_ApplicationServices/engine";
import OfflineBanner from "@/layers/1_Presentation/OfflineBanner";
import Header from "@/layers/2_Layouts/Header";
import Navigation from "@/layers/2_Layouts/Navigation";
import { SERVICE_METADATA } from "@/layers/6_ApplicationServices/constants";
import type { ApplicationStructure } from "@/layers/6_ApplicationServices/engine";

export default function DashboardPage() {
  const [applications, setApplications] = useState<ApplicationStructure[]>([]);
  const [events, setEvents] = useState<AuditEventStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    
    const interval = setInterval(fetchApplications, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleCreateApplication = async (serviceType: string, payload: Record<string, any>) => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceType, payload })
    });
    
    if (!res.ok) throw new Error("Failed to create application");
    
    await fetchApplications();
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 pb-24">
      <OfflineBanner />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            வணக்கம், Welcome!
          </h1>
          <p className="text-slate-600">Track your government service applications in real-time</p>
        </div>

        {/* Service Grid */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-black text-slate-800 mb-4">
            Available Services / கிடைக்கும் சேவைகள்
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(SERVICE_METADATA).map(([key, meta]) => (
              <a
                key={key}
                href={`/apply/${key}`}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-tn-red hover:shadow-lg transition-all text-center group"
              >
                <div className="text-4xl mb-3">{meta.icon}</div>
                <h3 className="font-bold text-slate-900 group-hover:text-tn-red transition-colors">
                  {meta.displayName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{meta.displayNameTamil}</p>
                <p className="text-xs text-slate-400 mt-2">
                  SLA: {meta.defaultDurationMinutes < 1440 
                    ? `${meta.defaultDurationMinutes} min` 
                    : `${meta.defaultDurationMinutes / 1440} days`}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* My Applications */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800">
            My Applications / என்னிடம் விண்ணப்பங்கள்
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Applications Yet</h3>
              <p className="text-slate-500 mb-4">Apply for a service to start tracking your SLA</p>
              <a
                href="/services"
                className="inline-block bg-tn-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors"
              >
                Apply Now
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <SLACountdownCard
                  key={app.id}
                  application={app}
                  events={events}
                  onSimulateAction={async (id, nextStatus) => {
                    // Simulation would typically go to an API route. Skipping for now.
                    await fetchApplications();
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  );
}