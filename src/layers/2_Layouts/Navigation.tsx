// src/components/layout/Navigation.tsx
"use client";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";

export default function Navigation() {
  const pathname = usePathname();
  const { language } = useLanguage();

  const navItems = [
    { href: "/", icon: "🏠", label: "Home", labelTamil: "முகப்பு" },
    { href: "/services", icon: "📋", label: "Services", labelTamil: "சேவைகள்" },
    { href: "/documents", icon: "📄", label: "Vault", labelTamil: "ஆவணங்கள்" },
    { href: "/settings", icon: "⚙️", label: "Settings", labelTamil: "அமைப்புகள்" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto glass-card rounded-2xl p-2 pointer-events-auto shadow-xl border border-white/80">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-tn-red bg-red-50/80 scale-105 font-bold shadow-sm"
                    : "text-slate-500 hover:text-tn-red hover:bg-slate-50/50"
                }`}
              >
                <span className={`text-2xl ${isActive ? "drop-shadow-sm" : "opacity-80"}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] uppercase tracking-wider mt-1">
                  {language === "en" ? item.label : item.labelTamil}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}