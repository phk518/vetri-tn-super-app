import DashboardClient from "./DashboardClient";

export default async function SuperAppDashboard() {
  let applications = [];
  let events = [];

  try {
    const [appsRes, eventsRes] = await Promise.all([
      fetch('http://127.0.0.1:8080/api/applications', { cache: 'no-store' }),
      fetch('http://127.0.0.1:8080/api/application_events', { cache: 'no-store' })
    ]);

    if (appsRes.ok) applications = await appsRes.json();
    if (eventsRes.ok) events = await eventsRes.json();
    
    // Sort applications by descending date just in case
    applications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    events.sort((a: any, b: any) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
  }

  return <DashboardClient applications={applications} events={events} />;
}