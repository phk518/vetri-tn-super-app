"use client";
import { useEffect, useState } from "react";
import { Clock, AlertTriangle, ShieldAlert } from "lucide-react";

export interface ApplicationRecord {
  id: string;
  applicant_name: string;
  service_type: string;
  status: "UNDER_REVIEW" | "SLA_BREACHED" | "RESOLVED";
  created_at: string;
  sla_deadline: string;
}

export default function SlaCard({ record, onResolve }: { record: ApplicationRecord; onResolve: (id: string) => void }) {
  const [msRemaining, setMsRemaining] = useState<number>(0);
  const [isBreached, setIsBreached] = useState<boolean>(record.status === "SLA_BREACHED");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (record.status === "RESOLVED") return;

    const runEvaluation = () => {
      const distance = new Date(record.sla_deadline).getTime() - new Date().getTime();
      
      if (distance <= 0) {
        setMsRemaining(0);
        setIsBreached(true);
        return;
      }
      setMsRemaining(distance);
    };

    runEvaluation();
    const ticker = setInterval(runEvaluation, 1000);

    return () => clearInterval(ticker);
  }, [record.sla_deadline, record.status]);

  const convertTimeLayout = (totalMs: number) => {
    const rawSeconds = Math.floor(totalMs / 1000);
    const splitMinutes = Math.floor(rawSeconds / 60);
    const finalSeconds = rawSeconds % 60;
    return `${splitMinutes.toString().padStart(2, "0")}:${finalSeconds.toString().padStart(2, "0")}`;
  };

  if (!mounted) return null; // Prevent SSR hydration mismatch

  const resolved = record.status === "RESOLVED";

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm mb-4 transition-all duration-300 ${
      isBreached && !resolved ? "border-tn-red shadow-red-100" : "border-slate-200"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block">
            ID: #{record.id.split('-')[0].toUpperCase()}
          </span>
          <h3 className="text-base font-bold text-slate-800">{record.service_type}</h3>
          <p className="text-xs text-slate-500">Applicant: {record.applicant_name}</p>
        </div>
        
        {/* Dynamic Status Badge */}
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all duration-500 ${
          resolved ? "bg-green-100 text-green-800 border border-green-200" :
          isBreached 
            ? "bg-tn-red text-white animate-pulse shadow-md shadow-red-200" 
            : "bg-tn-yellow text-amber-950 border border-tn-yellow-dark/20"
        }`}>
          {resolved ? "Resolved" : isBreached ? <><ShieldAlert size={12} /> Breached</> : <><Clock size={12} /> Pending</>}
        </span>
      </div>

      <div className={`p-3.5 rounded-lg border transition-all duration-500 flex justify-between items-center ${
        resolved ? "bg-green-50 border-green-100 text-green-700" :
        isBreached 
          ? "bg-red-50 border-red-200 text-red-700" 
          : "bg-amber-50 border-yellow-200 text-amber-900"
      }`}>
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-tight flex items-center gap-1">
            {resolved ? "SLA Met/Resolved" : isBreached ? <><AlertTriangle size={14}/> Escalated to DMO/Collector</> : "Official SLA Timer:"}
          </span>
          {!resolved && (
             <span className="text-xl font-mono font-black tracking-tighter mt-1">
               {isBreached ? "00:00" : convertTimeLayout(msRemaining)}
             </span>
          )}
        </div>

        {!resolved && (
          <button 
            onClick={() => onResolve(record.id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-sm transition-colors"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}