// src/components/layout/Header.tsx
"use client";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-tn-red-dark via-tn-red to-tn-yellow-dark text-white shadow-2xl relative overflow-hidden">
      {/* Decorative glass overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl lg:text-5xl drop-shadow-md">🏛️</div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight drop-shadow-sm">
                {language === "en" ? "Vetri TamilNadu" : "வெற்றி தமிழ்நாடு"}
              </h1>
              <p className="text-sm lg:text-base font-bold text-tn-yellow-light uppercase tracking-widest mt-1">
                {language === "en" ? "Super App" : "சூப்பர் ஆப்"}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            {language === "en" ? "தமிழ்" : "English"}
          </button>
        </div>
      </div>
    </header>
  );
}