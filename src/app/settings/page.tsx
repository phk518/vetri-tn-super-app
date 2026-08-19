// src/app/settings/page.tsx
"use client";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import { Settings, User, CheckCircle, Database, RefreshCw } from "lucide-react";

import Header from "@/layers/2_Layouts/Header";
import Navigation from "@/layers/2_Layouts/Navigation";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-140px)] bg-transparent relative z-10 pb-24">
      <Header />
      <div className="max-w-[1400px] mx-auto p-4 lg:p-8 mt-4">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <Settings size={20} className="text-[#DC2626]" />
        <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">
          {language === "en" ? "App Settings" : "பயன்பாட்டு அமைப்புகள்"}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-[#DC2626] flex items-center justify-center text-[10px]">A</span>
              {language === "en" ? "Language Preferences" : "மொழி முன்னுரிமை"}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-4 leading-relaxed">
              Select your preferred language for navigating the Vetri TamilNadu Super App. The application will immediately translate all institutional services and ledgers.
            </p>
            
            <div className="flex bg-slate-50 border border-slate-200 divide-x divide-slate-200">
              <button 
                onClick={() => setLanguage("en")}
                className={`flex-1 p-3 text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center ${language === "en" ? "text-[#DC2626] border-2 border-[#DC2626] bg-white" : "text-slate-500 hover:text-slate-800"}`}
              >
                ENGLISH
                {language === "en" && <div className="w-2 h-2 rounded-full bg-[#DC2626]" />}
              </button>
              <button 
                onClick={() => setLanguage("ta")}
                className={`flex-1 p-3 text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center ${language === "ta" ? "text-[#DC2626] border-2 border-[#DC2626] bg-white" : "text-slate-500 hover:text-slate-800"}`}
              >
                தமிழ்
                {language === "ta" && <div className="w-2 h-2 rounded-full bg-[#DC2626]" />}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-[#DC2626] flex items-center justify-center text-[10px]">!</span>
              {language === "en" ? "Notification Center" : "அறிவிப்பு மையம்"}
            </h2>
            
            <div className="flex justify-between items-center border border-slate-200 p-4">
              <div>
                <h3 className="text-[11px] font-bold text-slate-800">Push Alerts for SLA Breaches</h3>
                <p className="text-[9px] font-bold text-slate-500 mt-1">Receive immediate alerts when civic services are delayed.</p>
              </div>
              <div className="w-10 h-5 bg-[#DC2626] rounded-full flex items-center justify-end p-1 cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#F59E0B] p-6 border-4 border-[#D97706] text-center">
            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <User size={32} />
            </div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              {language === "en" ? "Citizen Profile" : "குடிமக்கள் சுயவிவரம்"}
            </h2>
            <div className="flex justify-center mt-2 mb-6">
              <span className="bg-white/30 text-slate-900 text-[9px] font-bold px-2 py-1 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle size={10} className="text-emerald-700" /> AADHAAR VERIFIED
              </span>
            </div>
            
            <div className="text-left bg-white/20 p-3 border-b border-white/30">
              <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest">FULL NAME</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Dr. Rajesh Kumar</p>
            </div>
            <div className="text-left bg-white/20 p-3">
              <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest">REGISTERED DISTRICT</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Chennai</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4">
            <h2 className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={12} />
              {language === "en" ? "App Data" : "பயன்பாட்டு தரவு"}
            </h2>
            <button className="w-full py-3 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
              <RefreshCw size={12} /> CLEAR LOCAL CACHE
            </button>
          </div>
          
        </div>

      </div>
      <Navigation />
    </div>
  );
}