// src/components/layout/Header.tsx
"use client";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-[#DC2626] text-white border-b-4 border-[#991B1B]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-[#DC2626] p-2 rounded flex items-center justify-center">
            <span className="text-xl font-bold">🏛</span>
          </div>
          <div>
            <h1 className="text-[16px] font-black uppercase tracking-wider leading-tight">
              {language === "en" ? "Vetri TamilNadu Super App" : "வெற்றி தமிழ்நாடு சூப்பர் ஆப்"}
            </h1>
            <p className="text-[10px] text-white/90 font-bold uppercase tracking-[0.2em] mt-0.5">
              {language === "en" ? "Institutional Portal" : "நிறுவன போர்டல்"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={async () => {
              const { logoutAction } = await import("@/app/actions");
              await logoutAction();
              window.location.href = "/login";
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-4 py-2 rounded-sm transition-colors uppercase flex items-center gap-2"
          >
            <span className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[8px]">×</span>
            {language === "en" ? "SIGN OUT" : "வெளியேறு"}
          </button>
          <button
            onClick={toggleLanguage}
            className="bg-[#991B1B] hover:bg-black/20 text-white text-[10px] font-bold px-4 py-2 rounded-sm transition-colors uppercase"
          >
            {language === "en" ? "SWITCH TO தமிழ்" : "SWITCH TO ENGLISH"}
          </button>
        </div>
      </div>
    </header>
  );
}