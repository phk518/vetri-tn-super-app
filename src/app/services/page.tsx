"use client";
import { Building2, Stethoscope, Car, Scale, ArrowRight } from "lucide-react";

const departments = [
  { name: "Revenue Department", icon: <Building2 size={24} />, desc: "Income, Nativity, and Community Certificates", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Health & Family Welfare", icon: <Stethoscope size={24} />, desc: "RPM Alerts, Hospital Records, Insurance", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { name: "Transport (RTO)", icon: <Car size={24} />, desc: "License Renewals, Vehicle Registration", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { name: "Police & Judiciary", icon: <Scale size={24} />, desc: "FIR Tracking, Background Verification", color: "bg-slate-100 text-slate-700 border-slate-300" }
];

export default function ServicesPage() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-black text-slate-800 mb-1">State Services Catalog</h1>
      <p className="text-sm font-medium text-slate-500 mb-8">Access 140+ Tamil Nadu government services instantly.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept, idx) => (
          <div key={idx} className="p-5 border border-slate-200 rounded-2xl hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${dept.color}`}>
                {dept.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{dept.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{dept.desc}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-tn-red flex items-center gap-1 transition-colors">
                Browse Directory <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}