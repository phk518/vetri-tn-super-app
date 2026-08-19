// src/components/sla/SLACountdownCard.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCountdown, evaluateSLAStatus, getCountdownColor } from "@/layers/6_ApplicationServices/engine";
import type { AuditEventStructure } from "@/layers/6_ApplicationServices/engine";
import { SERVICE_METADATA } from "@/layers/6_ApplicationServices/constants";
import type { ApplicationStructure as Application } from "@/layers/6_ApplicationServices/engine";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import { useGlobalTimer } from "@/layers/3_ViewModels/useGlobalTimer";

interface Props {
  application: Application;
  // These two were passed from page.tsx but missing from the interface — now added
  events: AuditEventStructure[];
  onSimulateAction: (
    id: string,
    nextStatus: "RESOLVED" | "RESOLVED_LATE" | "SLA_BREACHED"
  ) => void;
}

export default function SLACountdownCard({ application, events, onSimulateAction }: Props) {
  const { language } = useLanguage();
  const now = useGlobalTimer();

  const meta = SERVICE_METADATA[application.service_type as keyof typeof SERVICE_METADATA];

  const deadline = new Date(application.sla_deadline).getTime();
  const msRemaining = application.status === "RESOLVED" || application.status === "RESOLVED_LATE" || application.status === "SLA_BREACHED"
    ? 0
    : deadline - now;
  
  const status = evaluateSLAStatus(application);

  useEffect(() => {
    if (msRemaining <= 0 && (application.status === "NEW" || application.status === "UNDER_REVIEW" || application.status === "PENDING")) {
      onSimulateAction(application.id, "SLA_BREACHED");
    }
  }, [msRemaining, application.status, application.id, onSimulateAction]);

  const countdown = formatCountdown(msRemaining);
  const totalMs = application.sla_duration_minutes * 60 * 1000;
  const color = getCountdownColor(msRemaining, totalMs);

  // Count audit events belonging to this application
  const appEvents = events.filter((e) => e.application_id === application.id);

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
        // Fixed: was bg-tnYellow-light (camelCase) — must be bg-tn-yellow-light (kebab)
        return {
          bg: "bg-tn-yellow-light",
          border: "border-tn-yellow",
          text: "text-tn-yellow-dark",
          icon: "⏳",
          label: (status === "NEW" || status === "PENDING")
            ? (language === "en" ? "Acknowledgement Pending" : "ஒப்புதல் நிலுவையில் உள்ளது")
            : (language === "en" ? "Under Review" : "பரிசீலனையில் உள்ளது"),
          pulse: false,
        };
    }
  };

  const styles = getStatusStyles();
  const countdownColor =
    status === "SLA_BREACHED" || status === "RESOLVED"
      ? "text-slate-700"
      : color === "green"
      ? "text-green-600"
      : color === "yellow"
      ? "text-amber-600"
      : "text-red-600";

  const isActive = status === "NEW" || status === "UNDER_REVIEW" || status === "PENDING";

  return (
    <div
      className={`glass-card p-6 rounded-none border-2 ${styles.border} ${styles.bg} ${
        styles.pulse ? "animate-pulse" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{meta?.icon || "📄"}</div>
          <div>
            <h3 className="font-bold text-slate-900">
              {meta?.displayName || application.service_type}
            </h3>
            <p className="text-sm text-slate-500">{meta?.displayNameTamil}</p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text} border ${styles.border}`}
        >
          {styles.icon} {styles.label}
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-3 mb-5 bg-white/40 p-4 rounded-xl border border-white/60">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">{language === "en" ? "Tracking ID:" : "கண்காணிப்பு எண்:"}</span>
          <span className="font-mono font-bold text-slate-800 bg-white/60 px-2 py-0.5 rounded-md border border-white">
            {application.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">{language === "en" ? "Applicant:" : "விண்ணப்பதாரர்:"}</span>
          <span className="font-bold text-slate-800">{application.applicant_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">{language === "en" ? "Department:" : "துறை:"}</span>
          <span className="font-semibold text-slate-700">{application.department_code}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">{language === "en" ? "Audit Log:" : "தணிக்கை பதிவு:"}</span>
          <span className="font-mono text-slate-700 bg-white/60 px-2 py-0.5 rounded-md border border-white">
            {appEvents.length} {language === "en" ? "event(s)" : "நிகழ்வுகள்"}
          </span>
        </div>
      </div>

      {/* Countdown Timer — only for active applications */}
      {isActive && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="text-center">
            {countdown.isBreached ? (
              <div>
                <div className={`text-3xl font-black ${countdownColor} mb-2`}>
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </div>
                <p className="text-red-600 font-black text-sm uppercase tracking-wider mt-1">
                  {language === "en" ? "OVERDUE BY" : "தாமதம்:"} {Math.floor(countdown.overdueBy / 60000)} {language === "en" ? "min" : "நிமிடம்"}
                </p>
              </div>
            ) : (
              <div className={`text-3xl font-black ${countdownColor} drop-shadow-sm tracking-tight`}>
                {String(countdown.days).padStart(2, "0")}<span className="text-lg opacity-70">d</span> :{" "}
                {String(countdown.hours).padStart(2, "0")}<span className="text-lg opacity-70">h</span> :{" "}
                {String(countdown.minutes).padStart(2, "0")}<span className="text-lg opacity-70">m</span> :{" "}
                {String(countdown.seconds).padStart(2, "0")}<span className="text-lg opacity-70">s</span>
              </div>
            )}
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-3">
              {language === "en" ? "SLA Deadline:" : "SLA காலக்கெடு:"} {new Date(application.sla_deadline).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Deadlines */}
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 pt-4 border-t border-slate-200/50 mb-4">
        <div>
          <span className="text-slate-400">{language === "en" ? "Created:" : "உருவாக்கப்பட்டது:"}</span>{" "}
          <span className="text-slate-700">{new Date(application.created_at).toLocaleDateString("en-IN")}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400">{language === "en" ? "Deadline:" : "கடைசி நேரம்:"}</span>{" "}
          <span className="text-slate-700">{new Date(application.sla_deadline).toLocaleDateString("en-IN")}</span>
        </div>
      </div>

      {/* Action Buttons — wired to onSimulateAction (was silently ignored before) */}
      {isActive && (
        <div className="flex gap-2">
          <button
            onClick={() => onSimulateAction(application.id, "RESOLVED")}
            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            ✅ Mark Resolved
          </button>
          <button
            onClick={() => onSimulateAction(application.id, "SLA_BREACHED")}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            ⚠️ Simulate Breach
          </button>
        </div>
      )}

      {(status === "RESOLVED" || status === "RESOLVED_LATE") && application.resolved_at && (
        <p className="text-xs text-center text-slate-400 mt-2">
          Resolved: {new Date(application.resolved_at).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}