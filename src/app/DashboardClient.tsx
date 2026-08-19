"use client";
import { useState, useTransition } from "react";
import ApplicationForm from "@/layers/1_Presentation/ApplicationForm";
import SLACountdownCard from "@/layers/1_Presentation/SLACountdownCard";
import { ApplicationStructure, AuditEventStructure } from "@/layers/6_ApplicationServices/engine";
import { Layers, RefreshCw, User, Activity, AlertOctagon, CheckCircle } from "lucide-react";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import Header from "@/layers/2_Layouts/Header";
import Navigation from "@/layers/2_Layouts/Navigation";
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

  const activeCount = applications.filter(a => a.status === "NEW" || a.status === "UNDER_REVIEW" || a.status === "PENDING").length;
  const resolvedCount = applications.filter(a => a.status === "RESOLVED" || a.status === "RESOLVED_LATE").length;
  const breachedCount = applications.filter(a => a.status === "SLA_BREACHED").length;

  return (
    <div className="bg-transparent min-h-full relative z-10 pb-24">
      <Header />
      <div className="max-w-[1400px] mx-auto lg:grid lg:grid-cols-12 lg:gap-8 lg:p-8 p-4 mt-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <ApplicationForm />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 mt-6 lg:mt-0">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
              <Activity size={18} className="text-slate-400 mb-2" />
              <span className="text-4xl font-black text-slate-800">{activeCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{language === "en" ? "Active" : "செயலில்"}</span>
            </div>
            <div className="bg-white p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
              <CheckCircle size={18} className="text-slate-400 mb-2" />
              <span className="text-4xl font-black text-slate-800">{resolvedCount}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{language === "en" ? "Resolved" : "தீர்க்கப்பட்டது"}</span>
            </div>
            <div className="bg-white p-6 border border-red-200 bg-red-50/30 flex flex-col items-center justify-center text-center">
              <AlertOctagon size={18} className="text-[#DC2626] mb-2" />
              <span className="text-4xl font-black text-[#DC2626]">{breachedCount}</span>
              <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest mt-2">{language === "en" ? "Breached" : "மீறப்பட்டது"}</span>
            </div>
          </div>

          <section className="bg-white border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} className="text-slate-400" /> {language === "en" ? "Active Ledger" : "செயலில் உள்ள லெட்ஜர்"}
              </h2>
              <button onClick={handleRefresh} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">
                <RefreshCw size={12} className={isPending ? "animate-spin" : ""} /> {language === "en" ? "Sync DB" : "ஒத்திசை"}
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-none">
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
      <Navigation />
    </div>
  );
}
