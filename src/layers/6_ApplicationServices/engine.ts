export type ApplicationStatus = 'NEW' | 'UNDER_REVIEW' | 'RESOLVED' | 'RESOLVED_LATE' | 'SLA_BREACHED';

export interface Application {
  id: string;
  user_id: string;
  service_type: string;
  status: string;
  applicant_name: string;
  created_at: string;
  sla_duration_minutes: number;
  sla_deadline: string;
  breached_at: string | null;
  resolved_at: string | null;
  last_status_change: string;
  service_payload: any;
  assigned_officer_id: string | null;
  department_code: string;
  office_code: string | null;
  deleted_at: string | null;
}

export interface SLAPolicy {
  id: number;
  service_type: string;
  effective_from: string;
  effective_until: string | null;
  duration_minutes: number;
}

// Alias so page.tsx can use ApplicationStructure
export type ApplicationStructure = Application;

// Correct fields matching page.tsx usage and the application_events DB table
export type AuditEventStructure = {
  id: string;
  application_id: string;
  previous_status: string | null;
  new_status: string;
  actor_type: string;
  changed_at: string;
  cryptographic_hash: string;
};

// Called with 4 separate args: generateMockEventHash(appId, prevStatus, newStatus, timestamp)
// Previously only accepted 1 arg (data: any) — mismatch with every call site in page.tsx
export function generateMockEventHash(
  appId: string,
  previousStatus: string | null,
  newStatus: string,
  timestamp: string
): string {
  const input = JSON.stringify({ appId, previousStatus, newStatus, timestamp });
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padEnd(16, '0');
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

export function getCountdownColor(msRemaining: number, slaDurationMs: number): 'green' | 'yellow' | 'red' {
  const percentage = msRemaining / slaDurationMs;

  if (percentage > 0.5) return 'green';
  if (percentage > 0.1) return 'yellow';
  return 'red';
}