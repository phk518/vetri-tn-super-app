import type { Application, SLAPolicy, ApplicationStatus } from '../supabase/types';

// 1. Added types to satisfy the imports in page.tsx
export type ApplicationStructure = Application;
export type AuditEventStructure = {
  id: string;
  event_type: string;
  timestamp: string;
};

// 2. ADDED: The missing function that was causing your build error
export function generateMockEventHash(data: any): string {
  const input = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padEnd(8, '0');
}

// --- Existing Functions ---

export function getEffectivePolicy(
  policies: SLAPolicy[],
  serviceType: string,
  date: Date = new Date()
): SLAPolicy | null {
  const dateString = date.toISOString().split('T')[0];
  
  const matching = policies.filter(
    (p) =>
      p.service_type === serviceType &&
      p.effective_from <= dateString &&
      (p.effective_until === null || p.effective_until >= dateString)
  );

  if (matching.length === 0) return null;

  return matching.sort((a, b) => 
    b.effective_from.localeCompare(a.effective_from)
  )[0];
}

export function computeDeadline(createdAt: Date, durationMinutes: number): Date {
  return new Date(createdAt.getTime() + durationMinutes * 60 * 1000);
}

export function evaluateSLAStatus(application: Application): ApplicationStatus {
  if (application.resolved_at) {
    const resolvedAt = new Date(application.resolved_at);
    const deadline = new Date(application.sla_deadline);
    return resolvedAt > deadline ? 'RESOLVED_LATE' : 'RESOLVED';
  }

  if (application.breached_at) {
    return 'SLA_BREACHED';
  }

  const now = new Date();
  const deadline = new Date(application.sla_deadline);

  if (now > deadline) {
    return 'SLA_BREACHED';
  }

  return application.status as ApplicationStatus;
}

export function formatCountdown(msRemaining: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isBreached: boolean;
  overdueBy: number;
} {
  const isBreached = msRemaining < 0;
  const absoluteMs = Math.abs(msRemaining);
  
  const days = Math.floor(absoluteMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absoluteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absoluteMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absoluteMs % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isBreached,
    overdueBy: isBreached ? absoluteMs : 0,
  };
}

export function getCountdownColor(msRemaining: number): 'green' | 'yellow' | 'red' {
  const totalMs = 60 * 60 * 24 * 30 * 1000; 
  const percentage = msRemaining / totalMs;

  if (percentage > 0.5) return 'green';
  if (percentage > 0.1) return 'yellow';
  return 'red';
}