// src/components/layout/Navigation.tsx
"use client";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "🏠", label: "Home", labelTamil: "முகப்பு" },
    { href: "/services", icon: "📋", label: "Services", labelTamil: "சேவைகள்" },
    { href: "/documents", icon: "📄", label: "Documents", labelTamil: "ஆவணங்கள்" },
    { href: "/settings", icon: "⚙️", label: "Settings", labelTamil: "அமைப்புகள்" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-4xl mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive
                  ? "text-tnRed bg-red-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium mt-1">{language === "en" ? item.label : item.labelTamil}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}