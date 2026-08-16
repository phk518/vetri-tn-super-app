// src/components/forms/ApplicationForm.tsx
"use client";
import { useState, useTransition } from "react";
import { SERVICE_METADATA, ServiceType } from "@/layers/6_ApplicationServices/constants";
import { useLanguage } from "@/layers/4_StateManagement/LanguageProvider";
import { createApplicationAction } from "@/app/actions";

const SERVICE_TYPES = Object.keys(SERVICE_METADATA) as ServiceType[];

export default function ApplicationForm() {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<ServiceType>(SERVICE_TYPES[0]);
  const [isPending, startTransition] = useTransition();
  const meta = SERVICE_METADATA[selectedType];

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
      <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-5">
        {language === "en" ? "Submit a Request" : "ஒரு கோரிக்கையை சமர்ப்பிக்கவும்"}
      </h2>

      <form 
        action={(formData) => {
          startTransition(async () => {
            await createApplicationAction(formData);
          });
        }} 
        className="space-y-4"
      >
        {/* Hidden inputs to pass necessary info to server action */}
        <input type="hidden" name="serviceType" value={meta.displayName} />
        <input type="hidden" name="departmentCode" value={meta.departmentCode} />

        {/* Service type selector */}
        <div>
          <label htmlFor="serviceTypeSelect" className="block text-xs font-bold text-slate-500 uppercase mb-1">
            {language === "en" ? "Service Type" : "சேவை வகை"}
          </label>
          <select
            id="serviceTypeSelect"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ServiceType)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none text-sm"
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SERVICE_METADATA[type].icon} {SERVICE_METADATA[type].displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic fields for selected service */}
        {meta.formFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none text-sm"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "date" ? (
              <input
                id={field.name}
                name={field.name}
                type="date"
                required={field.required}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none text-sm"
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-tn-red focus:ring-2 focus:ring-red-100 outline-none text-sm"
              />
            )}
            <p className="text-xs text-slate-400 mt-1">{field.labelTamil}</p>
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-tn-red to-tn-yellow-dark text-white py-3 rounded-xl font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isPending 
            ? (language === "en" ? "Submitting…" : "சமர்ப்பிக்கிறது…") 
            : (language === "en" ? "Submit Application" : "விண்ணப்பத்தை சமர்ப்பிக்கவும்")}
        </button>
      </form>
    </div>
  );
}
