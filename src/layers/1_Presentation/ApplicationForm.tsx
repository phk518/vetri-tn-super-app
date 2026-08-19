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
    <div className="bg-white p-6 border border-slate-200">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
        {language === "en" ? "New Service Request" : "புதிய சேவை கோரிக்கை"}
        <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">Initiate a request protected by state SLAs.</p>
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
          <label htmlFor="serviceTypeSelect" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            {language === "en" ? "Select Civic Service" : "குடிமை சேவையைத் தேர்ந்தெடுக்கவும்"}
          </label>
          <select
            id="serviceTypeSelect"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ServiceType)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-sm transition-colors"
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SERVICE_METADATA[type].displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic fields for selected service */}
        {meta.formFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              {language === "en" ? field.label : field.labelTamil}{" "}
              {field.required && <span className="text-[#DC2626]">*</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-sm transition-colors"
              >
                <option value="">Select Option...</option>
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-sm transition-colors"
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={`Enter ${field.label}`}
                required={field.required}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] outline-none text-sm transition-colors"
              />
            )}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#DC2626] hover:bg-[#991B1B] text-white py-3 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending 
              ? (language === "en" ? "SUBMITTING..." : "சமர்ப்பிக்கிறது...") 
              : (language === "en" ? "SUBMIT APPLICATION TO LEDGER" : "லெட்ஜரில் விண்ணப்பத்தை சமர்ப்பிக்கவும்")}
          </button>
        </div>
      </form>
    </div>
  );
}
