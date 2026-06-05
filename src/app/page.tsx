"use client";
import { useState, useEffect } from "react";
import ApplicationForm from "@/components/forms/ApplicationForm";
import SLACountdownCard from "@/components/sla/SLACountdownCard";
import { ApplicationStructure, AuditEventStructure, generateMockEventHash } from "@/lib/sla/engine";
import { supabase } from "@/lib/supabase/client";
import { Layers, RefreshCw, User, Activity, AlertOctagon, CheckCircle } from "lucide-react";

const SLA_MAP: Record<string, number> = {
  "Driving License (RTO)": 3,
  "Smart Ration Card (PDS)": 2,
  "Maternal RPM Alert (Clinical)": 1,
};

export default function SuperAppDashboard() {
  const [applications, setApplications] = useState<ApplicationStructure[]>([]);
  const [events, setEvents] = useState<AuditEventStructure[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  const fetchDatabase = async () => {
    setIsSyncing(true);
    const { data: apps } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    const { data: evts } = await supabase.from("application_events").select("*").order("changed_at", { ascending: true });

    if (apps) setApplications(apps as ApplicationStructure[]);
    if (evts) setEvents(evts as AuditEventStructure[]);
    setIsSyncing(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchDatabase();
  }, []);

  const handleCreateApplication = async (name: string, type: string, payload: Record<string, any>, dept: string) => {
    const duration = SLA_MAP[type] || 2;
    const now = new Date();
    const explicitDeadline = new Date(now.getTime() + duration * 60000);
    const appId = crypto.randomUUID();
    const timestampStr = now.toISOString();

    const newApp: ApplicationStructure = {
      id: appId, user_id: "demo-user-123", applicant_name: name, service_type: type, status: "NEW", created_at: timestampStr,
      sla_duration_minutes: duration, sla_deadline: explicitDeadline.toISOString(), service_payload: payload, department_code: dept
    };

    const newEvent: AuditEventStructure = {
      id: crypto.randomUUID(), application_id: appId, previous_status: null, new_status: "NEW", actor_type: "citizen",
      changed_at: timestampStr, cryptographic_hash: generateMockEventHash(appId, null, "NEW", timestampStr)
    };

    setApplications((prev) => [newApp, ...prev]);
    setEvents((prev) => [newEvent, ...prev]);

    await supabase.from("applications").insert([newApp]);
    await supabase.from("application_events").insert([newEvent]);
  };

  const handleStatusMutation = async (id: string, nextStatus: "RESOLVED" | "RESOLVED_LATE" | "SLA_BREACHED") => {
    const timestamp = new Date().toISOString();
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp || currentApp.status === nextStatus) return;

    const appendEvent: AuditEventStructure = {
      id: crypto.randomUUID(), application_id: id, previous_status: currentApp.status, new_status: nextStatus,
      actor_type: nextStatus === "SLA_BREACHED" ? "system" : "officer", changed_at: timestamp,
      cryptographic_hash: generateMockEventHash(id, currentApp.status, nextStatus, timestamp)
    };

    setApplications((prev) => prev.map((app) => {
      if (app.id !== id) return app;
      return { ...app, status: nextStatus, breached_at: nextStatus === "SLA_BREACHED" ? timestamp : app.breached_at, resolved_at: nextStatus !== "SLA_BREACHED" ? timestamp : app.resolved_at };
    }));
    setEvents((prev) => [...prev, appendEvent]);

    await supabase.from("applications").update({
        status: nextStatus, breached_at: nextStatus === "SLA_BREACHED" ? timestamp : currentApp.breached_at, resolved_at: nextStatus !== "SLA_BREACHED" ? timestamp : currentApp.resolved_at
      }).eq("id", id);
    await supabase.from("application_events").insert([appendEvent]);
  };

  if (!mounted) return null;

  const activeCount = applications.filter(a => a.status === "NEW" || a.status === "UNDER_REVIEW").length;
  const resolvedCount = applications.filter(a => a.status === "RESOLVED" || a.status === "RESOLVED_LATE").length;
  const breachedCount = applications.filter(a => a.status === "SLA_BREACHED").length;

  return (
    <div className="bg-slate-50 min-h-full">
      {/* Mobile-Only Header (Hidden on Laptop/PC) */}
      <div className="lg:hidden bg-white px-4 py-5 border-b border-slate-200 mb-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome Back</p>
            <h2 className="text-lg font-black text-slate-800 leading-tight">Demo Citizen</h2>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Verified Account
            </p>
          </div>
        </div>
        <button onClick={fetchDatabase} className={`p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-tn-yellow transition-all ${isSyncing ? "animate-spin" : ""}`}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Responsive Grid (1 Column Mobile -> 2 Columns PC) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:p-8 p-4">
        
        {/* LEFT COLUMN: Profile & Action Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PC-Only Profile Card */}
          <div className="hidden lg:flex bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-col items-center text-center relative overflow-hidden">
            <button onClick={fetchDatabase} className={`absolute top-4 right-4 text-slate-400 hover:text-tn-yellow transition-colors ${isSyncing ? "animate-spin" : ""}`}>
              <RefreshCw size={16} />
            </button>
            <div className="w-20 h-20 bg-slate-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-4 z-10">
              <User size={40} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Welcome Back</p>
            <h2 className="text-xl font-black text-slate-800 leading-tight mb-1 z-10">Demo Citizen</h2>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 z-10">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> State Identity Verified
            </p>
          </div>

          <ApplicationForm onFormSubmit={handleCreateApplication} />
        </div>

        {/* RIGHT COLUMN: Telemetry & Live SLA Ledger */}
        <div className="lg:col-span-8 mt-6 lg:mt-0">
          
          {/* Live Telemetry Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <Activity size={20} className="text-blue-500 mb-2 md:mb-3" />
              <span className="text-3xl md:text-4xl font-black text-slate-800">{activeCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active</span>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <CheckCircle size={20} className="text-emerald-500 mb-2 md:mb-3" />
              <span className="text-3xl md:text-4xl font-black text-slate-800">{resolvedCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Resolved</span>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <AlertOctagon size={20} className="text-tn-red mb-2 md:mb-3 relative z-10" />
              <span className="text-3xl md:text-4xl font-black text-tn-red relative z-10">{breachedCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Breached</span>
              {breachedCount > 0 && <div className="absolute inset-0 bg-red-50 opacity-50 z-0"></div>}
            </div>
          </div>

          {/* Active Queue */}
          <section>
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-tn-yellow-dark" /> Live Tracking
              </h2>
              <span className="text-[10px] font-bold bg-tn-yellow-light text-tn-yellow-dark px-2.5 py-1 rounded-md border border-tn-yellow shadow-sm">
                Immutable Ledger
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-100/50 shadow-inner">
                <p className="text-sm text-slate-500 font-medium">Your digital locker is empty.<br/>Submit a request on the left.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {applications.map((app) => (
                  <SLACountdownCard 
                    key={app.id}
                    application={app}
                    events={events}
                    onSimulateAction={handleStatusMutation}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
        
      </div>
    </div>
  );
}