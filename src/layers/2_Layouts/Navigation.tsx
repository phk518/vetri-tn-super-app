// src/components/layout/Navigation.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import { Home, FileText, Lock, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { language } = useLanguage();

  const navItems = [
    { href: "/", icon: Home, label: "Home", labelTamil: "முகப்பு" },
    { href: "/services", icon: FileText, label: "Services", labelTamil: "சேவைகள்" },
    { href: "/documents", icon: Lock, label: "Vault", labelTamil: "பெட்டகம்" },
    { href: "/settings", icon: Settings, label: "Settings", labelTamil: "அமைப்புகள்" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-center items-center space-x-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center pt-3 pb-2 px-6 transition-all duration-300 border-t-2 ${
                  isActive
                    ? "border-[#DC2626] text-[#DC2626]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                <span className={`text-[9px] uppercase tracking-widest font-bold`}>
                  {language === "en" ? item.label : item.labelTamil}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}