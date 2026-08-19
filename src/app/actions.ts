"use server";
import { revalidatePath } from "next/cache";

export async function createApplicationAction(formData: FormData) {
  const serviceType = formData.get("serviceType") as string;
  const applicantName = (formData.get("applicant_name") || formData.get("beneficiary_name") || "Unknown") as string;
  
  // Need to find department code
  // We can just rely on the form sending it, or we can look it up. Let's require the form to send a hidden input with departmentCode.
  const departmentCode = formData.get("departmentCode") as string;

  const payload: Record<string, any> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (key !== "serviceType" && key !== "departmentCode" && key !== "applicant_name" && key !== "beneficiary_name") {
      payload[key] = value;
    }
  }

  const requestBody = {
    user_id: "demo-user-123",
    service_type: serviceType,
    applicant_name: applicantName,
    department_code: departmentCode,
    service_payload: payload
  };

  try {
    const res = await fetch('http://127.0.0.1:8080/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!res.ok) {
      console.error("Failed to create application via Rust:", await res.text());
    }
  } catch (err) {
    console.error("Error creating application:", err);
  }

  revalidatePath('/');
}

export async function updateApplicationStatusAction(id: string, newStatus: string) {
  try {
    const res = await fetch(`http://127.0.0.1:27018/proxy/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
      console.error("Failed to update application via db-proxy:", await res.text());
    }
  } catch (err) {
    console.error("Error updating application status:", err);
  }
  revalidatePath('/');
}

import { cookies } from "next/headers";

export async function loginAction(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, { path: '/', httpOnly: true, sameSite: 'strict' });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
