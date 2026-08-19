"use client";
import { useState, useEffect } from "react";
import ApplicationForm from "@/layers/1_Presentation/ApplicationForm";
import SLACountdownCard from "@/layers/1_Presentation/SLACountdownCard";
import { ApplicationStructure, AuditEventStructure, generateMockEventHash } from "@/layers/6_ApplicationServices/engine";

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
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch', error);
    }
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
      sla_duration_minutes: duration, sla_deadline: explicitDeadline.toISOString(), service_payload: payload, department_code: dept,
      last_status_change: timestampStr, breached_at: null, resolved_at: null,
      assigned_officer_id: null, office_code: null, deleted_at: null,
    };

    const newEvent: AuditEventStructure = {
      id: crypto.randomUUID(), application_id: appId, previous_status: null, new_status: "NEW", actor_type: "citizen",
      changed_at: timestampStr, cryptographic_hash: generateMockEventHash(appId, null, "NEW", timestampStr)
    };

    setApplications((prev) => [newApp, ...prev]);
    setEvents((prev) => [newEvent, ...prev]);
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
  };

  if (!mounted) return null;

  const activeCount = applications.filter(a => a.status === "NEW" || a.status === "UNDER_REVIEW").length;
  const resolvedCount = applications.filter(a => a.status === "RESOLVED" || a.status === "RESOLVED_LATE").length;
  const breachedCount = applications.filter(a => a.status === "SLA_BREACHED").length;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-transparent relative z-10 pb-24">
      <Header />
      <div className="max-w-[1400px] mx-auto p-4 lg:p-8 mt-4">
        
        <div className="mb-8 border-b border-slate-200 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest">
              Encrypted Ledger Vault
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> Cryptographically secured records
            </p>
          </div>
          <button 
            onClick={fetchDatabase} 
            className={`border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest bg-white hover:bg-slate-50 px-4 py-2 transition-colors flex items-center gap-2 ${isSyncing ? "animate-pulse" : ""}`}
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "SYNCING..." : "SYNC DB"}
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white">
            <Layers size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Your vault is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
      <Navigation />
    </div>
  );
}