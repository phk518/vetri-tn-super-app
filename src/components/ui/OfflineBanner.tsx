// src/components/ui/OfflineBanner.tsx
"use client";
import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2 text-amber-800">
        <span className="text-xl">📶</span>
        <span className="text-sm font-medium">
          Offline — showing data from {lastSync.toLocaleTimeString("en-IN")}
        </span>
        <span className="text-xs">(Estimated timers only)</span>
      </div>
    </div>
  );
}