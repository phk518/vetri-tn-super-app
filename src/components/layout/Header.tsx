// src/components/layout/Header.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "ta">("en");

  return (
    <header className="bg-gradient-to-r from-tnRed-dark to-tnRed text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🏛️</div>
            <div>
              <h1 className="text-xl font-black">
                {language === "en" ? "Vetri Tamil Nadu" : "வெற்றி தமிழ்நாடு"}
              </h1>
              <p className="text-xs opacity-90">
                {language === "en" ? "Super App Portal" : "சூப்பர் ஆப் போர்ட்டல்"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setLanguage(language === "en" ? "ta" : "en");
            }}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            {language === "en" ? "தமிழ்" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}