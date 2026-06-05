"use client";
import { useState, useEffect } from "react";
import ApplicationForm from "@/components/forms/ApplicationForm";
import SLACountdownCard from "@/components/sla/SLACountdownCard";
import { ApplicationStructure, AuditEventStructure, generateMockEventHash } from "@/lib/sla/engine";
import { supabase } from "@/lib/supabase/client";
import { Layers, RefreshCw, Activity, AlertOctagon, CheckCircle, Clock, ShieldCheck } from "lucide-react";

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
    <div className="bg-slate-50 min-h-full pb-20">
      
      {/* 1. Minimalist Profile Header */}
      <div className="bg-white px-6 py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Overview</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Identity Verified
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-8 lg:p-8 p-4 mt-2">
        
        {/* LEFT COLUMN: Request Initiation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">New Service Request</h3>
              <p className="text-xs text-slate-500 mt-1">Initiate a request protected by state SLAs.</p>
            </div>
            <div className="p-2">
               <ApplicationForm onFormSubmit={handleCreateApplication} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Telemetry & Ledger */}
        <div className="lg:col-span-7 mt-6 lg:mt-0 space-y-6">
          
          {/* Streamlined Telemetry Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white py-5 px-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <Activity size={18} className="text-slate-400 mb-2" />
              <span className="text-3xl font-black text-slate-800">{activeCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active</span>
            </div>
            <div className="bg-white py-5 px-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <CheckCircle size={18} className="text-slate-400 mb-2" />
              <span className="text-3xl font-black text-slate-800">{resolvedCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Resolved</span>
            </div>
            <div className="bg-white py-5 px-4 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center bg-red-50/50">
              <AlertOctagon size={18} className="text-tn-red mb-2" />
              <span className="text-3xl font-black text-tn-red">{breachedCount}</span>
              <span className="text-[10px] font-bold text-tn-red uppercase tracking-wider mt-1">Breached</span>
            </div>
          </div>

          {/* Singular Focus: The Ledger */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Active Ledger
                </h2>
              </div>
              {/* The ONLY Refresh Button on the page */}
              <button 
                onClick={fetchDatabase} 
                className={`flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all ${isSyncing ? "animate-pulse" : ""}`}
              >
                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing..." : "Sync DB"}
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Layers size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">Your ledger is empty.<br/>Submit a request on the left.</p>
              </div>
            ) : (
              <div className="space-y-4">
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