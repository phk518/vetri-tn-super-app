// src/app/api/applications/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceType, payload } = await req.json();

    const { data: policy } = await supabase
      .from('sla_policies')
      .select('*')
      .eq('service_type', serviceType)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (!policy) {
      return NextResponse.json({ error: 'SLA policy not found' }, { status: 404 });
    }

    const createdAt = new Date();
    const slaDeadline = new Date(createdAt.getTime() + policy.duration_minutes * 60 * 1000);

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        service_type: serviceType,
        applicant_name: payload.applicant_name || payload.beneficiary_name,
        sla_duration_minutes: policy.duration_minutes,
        sla_deadline: slaDeadline.toISOString(),
        status: 'NEW',
        department_code: 'GENERAL',
        service_payload: payload,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('application_events').insert({
      application_id: application.id,
      new_status: 'NEW',
      actor_type: 'citizen',
      metadata: { created_by: user.id },
    });

    return NextResponse.json(application);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sla_deadline', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}