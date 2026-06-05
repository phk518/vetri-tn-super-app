// src/components/sla/SLACountdownCard.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCountdown, evaluateSLAStatus, getCountdownColor } from "@/lib/sla/engine";
import { SERVICE_METADATA } from "@/lib/sla/constants";
import type { Application } from "@/lib/supabase/types";

interface Props {
  application: Application;
}

export default function SLACountdownCard({ application }: Props) {
  const [msRemaining, setMsRemaining] = useState(0);
  const [status, setStatus] = useState(evaluateSLAStatus(application));

  const meta = SERVICE_METADATA[application.service_type as keyof typeof SERVICE_METADATA];

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const deadline = new Date(application.sla_deadline).getTime();
      setMsRemaining(deadline - now);
      setStatus(evaluateSLAStatus(application));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [application.sla_deadline, application.resolved_at, application.breached_at]);

  const countdown = formatCountdown(msRemaining);
  const color = getCountdownColor(msRemaining);

  const getStatusStyles = () => {
    switch (status) {
      case "SLA_BREACHED":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          text: "text-red-700",
          icon: "⚠️",
          label: "SLA BREACHED",
          pulse: true,
        };
      case "RESOLVED":
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          text: "text-green-700",
          icon: "✅",
          label: "Resolved",
          pulse: false,
        };
      case "RESOLVED_LATE":
        return {
          bg: "bg-amber-50",
          border: "border-amber-300",
          text: "text-amber-700",
          icon: "✅⚠️",
          label: "Resolved (Late)",
          pulse: false,
        };
      default:
        return {
          bg: "bg-tnYellow-light",
          border: "border-tnYellow",
          text: "text-tnYellow-dark",
          icon: "⏳",
          label: status === "NEW" ? "Acknowledgement Pending" : "Under Review",
          pulse: false,
        };
    }
  };

  const styles = getStatusStyles();
  const countdownColor = status === "SLA_BREACHED" || status === "RESOLVED" 
    ? "text-slate-700" 
    : color === "green" 
      ? "text-green-600" 
      : color === "yellow" 
        ? "text-amber-600" 
        : "text-red-600";

  return (
    <div className={`glass-card p-6 rounded-2xl border-2 ${styles.border} ${styles.bg} ${styles.pulse ? "animate-pulse" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{meta?.icon || "📄"}</div>
          <div>
            <h3 className="font-bold text-slate-900">{meta?.displayName || application.service_type}</h3>
            <p className="text-sm text-slate-500">{meta?.displayNameTamil}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text} border ${styles.border}`}>
          {styles.icon} {styles.label}
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tracking ID:</span>
          <span className="font-mono font-bold text-slate-700">{application.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Applicant:</span>
          <span className="font-semibold text-slate-700">{application.applicant_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Department:</span>
          <span className="text-slate-700">{application.department_code}</span>
        </div>
      </div>

      {/* Countdown Timer */}
      {status !== "RESOLVED" && status !== "RESOLVED_LATE" && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="text-center">
            {countdown.isBreached ? (
              <div>
                <div className={`text-3xl font-black ${countdownColor} mb-2`}>
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </div>
                <p className="text-red-600 font-bold text-sm">
                  OVERDUE BY {Math.floor(countdown.overdueBy / 60000)} min
                </p>
              </div>
            ) : (
              <div className={`text-3xl font-black ${countdownColor}`}>
                {String(countdown.days).padStart(2, "0")}d :{" "}
                {String(countdown.hours).padStart(2, "0")}h :{" "}
                {String(countdown.minutes).padStart(2, "0")}m :{" "}
                {String(countdown.seconds).padStart(2, "0")}s
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deadlines */}
      <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
        <div>
          <span className="font-semibold">Created:</span>{" "}
          {new Date(application.created_at).toLocaleDateString("en-IN")}
        </div>
        <div className="text-right">
          <span className="font-semibold">Deadline:</span>{" "}
          {new Date(application.sla_deadline).toLocaleString("en-IN")}
        </div>
      </div>

      {/* Action Button */}
      {status === "NEW" && (
        <a
          href={`/application/${application.id}`}
          className="block mt-4 text-center bg-white border border-tn-red text-tn-red py-2 rounded-xl font-bold hover:bg-tn-red hover:text-white transition-colors"
        >
          View Details
        </a>
      )}
    </div>
  );
}