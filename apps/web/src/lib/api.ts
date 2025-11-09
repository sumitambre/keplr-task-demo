// Lightweight API wrapper for admin app. Uses fetch with Authorization and X-Tenant headers.
// Falls back gracefully if VITE_API_URL is not set or requests fail.

export type TaskTypeDto = {
  id: number;
  name: string;
  skillRequired: string;
};

const API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function getTenant(): string | null {
  try {
    const hint = (import.meta as any).env?.VITE_TENANT_HINT as string | undefined;
    if (hint) return hint;
    // naive subdomain parser: tenant.myapp.com => tenant
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 2) return parts[0];
    return localStorage.getItem("tenant");
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("VITE_API_URL not configured");
  const token = getToken();
  const tenant = getTenant();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (tenant) headers.set("X-Tenant", tenant);
  const res = await fetch(API_URL.replace(/\/$/, "") + path, {
    ...init,
    headers,
  });
  if (!res.ok) {
    // try ProblemDetails
    let body: any = null;
    try { body = await res.json(); } catch {}
    const msg = body?.title || body?.message || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  // empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function getClientTaskTypes(clientId: number): Promise<TaskTypeDto[]> {
  return apiFetch<TaskTypeDto[]>(`/clients/${clientId}/task-types`);
}

export async function addClientTaskType(
  clientId: number,
  payload: { name: string; skillRequired: string }
): Promise<TaskTypeDto> {
  return apiFetch<TaskTypeDto>(`/clients/${clientId}/task-types`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getClientServiceTypes(clientId: number): Promise<string[]> {
  const result = await apiFetch<any>(`/clients/${clientId}/service-types`);
  if (Array.isArray(result)) {
    // Could be array of strings or array of {name}
    return result.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean);
  }
  return [];
}

export async function addClientServiceType(clientId: number, name: string): Promise<{ name: string }> {
  return apiFetch<{ name: string }>(`/clients/${clientId}/service-types`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

