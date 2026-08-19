import DashboardClient from "./DashboardClient";

import { ApplicationStructure, AuditEventStructure } from "@/layers/6_ApplicationServices/engine";

export default async function SuperAppDashboard() {
  let applications: ApplicationStructure[] = [];
  let events: AuditEventStructure[] = [];

  try {
    const [appsRes, eventsRes] = await Promise.all([
      fetch('http://127.0.0.1:8080/api/applications', { cache: 'no-store' }),
      fetch('http://127.0.0.1:8080/api/application_events', { cache: 'no-store' })
    ]);

    if (appsRes.ok) applications = await appsRes.json();
    if (eventsRes.ok) events = await eventsRes.json();
    
    // Sort applications by descending date just in case
    applications.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    events.sort((a: { changed_at: string }, b: { changed_at: string }) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
  }

  return <DashboardClient applications={applications} events={events} />;
}