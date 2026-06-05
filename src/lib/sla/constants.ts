// src/lib/sla/constants.ts
import type { ServiceType } from '../supabase/types';

export const SERVICE_METADATA: Record<ServiceType, {
  displayName: string;
  displayNameTamil: string;
  icon: string;
  departmentCode: string;
  defaultDurationMinutes: number;
  formFields: {
    name: string;
    label: string;
    labelTamil: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }[];
}> = {
  DRIVING_LICENSE: {
    displayName: 'Driving License',
    displayNameTamil: ' ஓட்டுநர் உரிமம்',
    icon: '🚗',
    departmentCode: 'RTO',
    defaultDurationMinutes: 43200, // 30 days (or 3 for demo)
    formFields: [
      { name: 'applicant_name', label: 'Full Name', labelTamil: 'முழு பெயர்', type: 'text', required: true },
      { name: 'vehicle_class', label: 'Vehicle Class', labelTamil: 'வாகன வகுப்பு', type: 'select', required: true, options: ['LMV', 'HV', 'MCWG', 'MCWOG'] },
      { name: 'rto_code', label: 'RTO Code', labelTamil: 'ஆர்.டி.ஓ. குறியீடு', type: 'text', required: true },
    ],
  },
  RATION_CARD: {
    displayName: 'Ration Card',
    displayNameTamil: 'அரிசி அட்டை',
    icon: '🍚',
    departmentCode: 'PDS',
    defaultDurationMinutes: 21600, // 15 days (or 2 for demo)
    formFields: [
      { name: 'applicant_name', label: 'Full Name', labelTamil: 'முழு பெயர்', type: 'text', required: true },
      { name: 'card_type', label: 'Card Type', labelTamil: 'அட்டை வகை', type: 'select', required: true, options: ['PHH', 'AAY', 'NPHH'] },
      { name: 'family_members', label: 'Family Members', labelTamil: 'குடும்ப உறுப்பினர்கள்', type: 'number', required: true },
    ],
  },
  BIRTH_REGISTRATION: {
    displayName: 'Birth Registration',
    displayNameTamil: 'பிறப்புப் பதிவு',
    icon: '👶',
    departmentCode: 'HEALTH',
    defaultDurationMinutes: 10080, // 7 days (or 1.5 for demo)
    formFields: [
      { name: 'applicant_name', label: 'Parent Name', labelTamil: 'பெற்றோர் பெயர்', type: 'text', required: true },
      { name: 'child_name', label: 'Child Name', labelTamil: 'குழந்தை பெயர்', type: 'text', required: true },
      { name: 'date_of_birth', label: 'Date of Birth', labelTamil: 'பிறந்த தேதி', type: 'date', required: true },
      { name: 'hospital_code', label: 'Hospital Code', labelTamil: 'ஆஸ்பத்திரி குறியீடு', type: 'text', required: true },
    ],
  },
  RPM_ALERT: {
    displayName: 'RPM Alert',
    displayNameTamil: 'ஆரோக்கிய எச்சரிக்கை',
    icon: '🏥',
    departmentCode: 'HEALTH',
    defaultDurationMinutes: 120, // 2 hours (or 1 for demo)
    formFields: [
      { name: 'beneficiary_name', label: 'Patient Name', labelTamil: 'நோயாளி பெயர்', type: 'text', required: true },
      { name: 'alert_type', label: 'Alert Type', labelTamil: 'எச்சரிக்கை வகை', type: 'select', required: true, options: ['CRITICAL', 'MODERATE', 'LOW'] },
      { name: 'vitals', label: 'Vital Signs', labelTamil: 'உயிர் அறிகுறிகள்', type: 'text', required: true },
    ],
  },
};