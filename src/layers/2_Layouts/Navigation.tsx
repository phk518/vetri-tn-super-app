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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex justify-center items-center space-x-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-sm transition-all duration-300 ${
                  isActive
                    ? "text-[#DC2626] font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className={`text-xl ${isActive ? "" : "opacity-70"}`}>
                  {item.icon}
                </span>
                <span className="text-[9px] uppercase tracking-wider mt-1.5 font-bold">
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