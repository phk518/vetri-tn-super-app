"use client";
import { useState, useTransition } from "react";
import ApplicationForm from "@/layers/1_Presentation/ApplicationForm";
import SLACountdownCard from "@/layers/1_Presentation/SLACountdownCard";
import { ApplicationStructure, AuditEventStructure } from "@/layers/6_ApplicationServices/engine";
import { Layers, RefreshCw, User, Activity, AlertOctagon, CheckCircle } from "lucide-react";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import Header from "@/layers/2_Layouts/Header";
import { updateApplicationStatusAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface Props {
  applications: ApplicationStructure[];
  events: AuditEventStructure[];
}

export default function DashboardClient({ applications, events }: Props) {
  const { language } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleStatusMutation = (id: string, nextStatus: "RESOLVED" | "RESOLVED_LATE" | "SLA_BREACHED") => {
    startTransition(async () => {
      await updateApplicationStatusAction(id, nextStatus);
    });
  };

  const activeCount = applications.filter(a => a.status === "NEW" || a.status === "UNDER_REVIEW").length;
  const resolvedCount = applications.filter(a => a.status === "RESOLVED" || a.status === "RESOLVED_LATE").length;
  const breachedCount = applications.filter(a => a.status === "SLA_BREACHED").length;

  return (
    <div className="bg-transparent min-h-full relative z-10 pb-24">
      <Header />
      {/* Mobile-Only Profile Banner */}
      <div className="lg:hidden glass-card mx-4 mt-4 px-4 py-4 mb-4 shadow-sm rounded-2xl flex items-center justify-between border border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language === "en" ? "Welcome Back" : "மீண்டும் வருக"}</p>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Demo Citizen</h2>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {language === "en" ? "Verified Account" : "சரிபார்க்கப்பட்ட கணக்கு"}
            </p>
          </div>
        </div>
        <button onClick={handleRefresh} className={`p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-tn-yellow transition-all ${isPending ? "animate-spin" : ""}`}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:p-8 p-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="hidden lg:flex glass-card p-6 rounded-2xl flex-col items-center text-center relative overflow-hidden">
            <button onClick={handleRefresh} className={`absolute top-4 right-4 text-slate-400 hover:text-tn-yellow transition-colors ${isPending ? "animate-spin" : ""}`}>
              <RefreshCw size={16} />
            </button>
            <div className="w-20 h-20 bg-slate-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-4 z-10">
              <User size={40} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">{language === "en" ? "Welcome Back" : "மீண்டும் வருக"}</p>
            <h2 className="text-xl font-black text-slate-900 leading-tight mb-1 z-10">Demo Citizen</h2>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 z-10">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {language === "en" ? "State Identity Verified" : "மாநில அடையாளம் சரிபார்க்கப்பட்டது"}
            </p>
          </div>

          <ApplicationForm />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 mt-6 lg:mt-0">
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Activity size={20} className="text-blue-600 mb-2 md:mb-3" />
              <span className="text-3xl md:text-4xl font-black text-slate-900">{activeCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">{language === "en" ? "Active" : "செயலில்"}</span>
            </div>
            <div className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <CheckCircle size={20} className="text-emerald-600 mb-2 md:mb-3" />
              <span className="text-3xl md:text-4xl font-black text-slate-900">{resolvedCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">{language === "en" ? "Resolved" : "தீர்க்கப்பட்டது"}</span>
            </div>
            <div className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <AlertOctagon size={20} className="text-tn-red mb-2 md:mb-3 relative z-10" />
              <span className="text-3xl md:text-4xl font-black text-tn-red relative z-10">{breachedCount}</span>
              <span className="text-[9px] md:text-xs font-bold text-slate-600 uppercase tracking-wider mt-1 relative z-10">{language === "en" ? "Breached" : "மீறப்பட்டது"}</span>
              {breachedCount > 0 && <div className="absolute inset-0 bg-red-50 opacity-50 z-0"></div>}
            </div>
          </div>

          <section>
            <div className="flex justify-between items-center mb-5 border-b border-black/10 pb-3">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-tn-yellow-dark" /> {language === "en" ? "Live Tracking" : "நேரடி கண்காணிப்பு"}
              </h2>
              <span className="text-[10px] font-bold bg-tn-yellow-light/80 text-tn-yellow-dark px-2.5 py-1 rounded-md shadow-sm">
                {language === "en" ? "Immutable Ledger" : "மாற்ற முடியாத லெட்ஜர்"}
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <p className="text-sm text-slate-600 font-bold">{language === "en" ? "Your digital locker is empty." : "உங்கள் டிஜிட்டல் லாக்கர் காலியாக உள்ளது."}<br/>{language === "en" ? "Submit a request on the left." : "இடதுபுறத்தில் ஒரு கோரிக்கையைச் சமர்ப்பிக்கவும்."}</p>
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
