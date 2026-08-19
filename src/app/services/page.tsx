
import { Building2, Stethoscope, Car, Scale, ArrowRight } from "lucide-react";

const departments = [
  { name: "Revenue Department", icon: <Building2 size={24} />, desc: "Income, Nativity, and Community Certificates", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Health & Family Welfare", icon: <Stethoscope size={24} />, desc: "RPM Alerts, Hospital Records, Insurance", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { name: "Transport (RTO)", icon: <Car size={24} />, desc: "License Renewals, Vehicle Registration", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { name: "Police & Judiciary", icon: <Scale size={24} />, desc: "FIR Tracking, Background Verification", color: "bg-slate-100 text-slate-700 border-slate-300" }
];

import Header from "@/layers/2_Layouts/Header";
import Navigation from "@/layers/2_Layouts/Navigation";

export default function ServicesPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-transparent relative z-10 pb-24">
      <Header />
      <div className="max-w-[1400px] mx-auto p-4 lg:p-8 mt-4">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">State Services Catalog</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Access 140+ Tamil Nadu government services instantly.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept, idx) => (
            <div key={idx} className="p-5 border border-slate-200 bg-white hover:border-[#0F172A] transition-all cursor-pointer flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className={`p-3 border ${dept.color}`}>
                  {dept.icon}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase">{dept.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">{dept.desc}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626] flex items-center gap-1">
                  BROWSE <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navigation />
    </div>
  );
}