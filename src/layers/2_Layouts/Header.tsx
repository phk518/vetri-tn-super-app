// src/components/layout/Header.tsx
"use client";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-tn-red text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-tn-red p-2 rounded flex items-center justify-center">
            <span className="text-xl font-bold">🏛</span>
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide leading-tight">
              {language === "en" ? "Vetri TamilNadu Super App" : "வெற்றி தமிழ்நாடு சூப்பர் ஆப்"}
            </h1>
            <p className="text-xs text-tn-red-light font-medium uppercase tracking-widest">
              {language === "en" ? "Institutional Portal" : "நிறுவன போர்டல்"}
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleLanguage}
          className="bg-tn-red-dark hover:bg-black/20 text-white text-xs font-bold px-3 py-1 border border-tn-red-light transition-colors uppercase"
        >
          {language === "en" ? "SWITCH TO தமிழ்" : "SWITCH TO ENGLISH"}
        </button>
      </div>
    </header>
  );
}