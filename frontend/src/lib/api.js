const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const TOKEN_KEY = "token";

// ---------------------
// Token helpers
// ---------------------
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ✅ Alias para compatibilidad con imports antiguos
export const removeToken = clearToken;

// ---------------------
// Utils
// ---------------------
async function safeJson(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

function extractLaravelErrors(data) {
  const errs = data?.errors;
  if (!errs || typeof errs !== "object") return null;
  const k = Object.keys(errs)[0];
  const v = k ? errs[k] : null;
  if (Array.isArray(v) && v.length) return v[0];
  if (typeof v === "string") return v;
  return null;
}

export async function request(
  path,
  { method = "GET", body, auth = true, signal, headers: extraHeaders } = {}
) {
  const headers = { Accept: "application/json", ...(extraHeaders || {}) };
  const isForm = body instanceof FormData;

  if (body !== undefined && body !== null && !isForm) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    signal,
    body:
      body === undefined || body === null
        ? undefined
        : isForm
          ? body
          : JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    if (signal?.aborted) {
      const e = new Error("AbortError");
      e.name = "AbortError";
      throw e;
    }

    const laravelMsg = extractLaravelErrors(data);
    const msg =
      laravelMsg ||
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      `Error ${res.status}`;

    if (res.status === 401) throw new Error("No autorizado. Inicia sesión.");
    if (res.status === 403) throw new Error("No tienes permisos para esta acción.");
    throw new Error(msg);
  }

  return data;
}

// ---------------------
// Auth (tu backend devuelve token en data.token / data.data.token)
// ---------------------
export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  const token = data?.token || data?.access_token || data?.data?.token;
  if (!token) throw new Error("Login OK pero no llegó token.");

  setToken(token);
  return data;
}

export async function register(name, email, password, password_confirmation) {
  const data = await request("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password, password_confirmation },
  });

  const token = data?.token || data?.access_token || data?.data?.token;
  if (token) setToken(token);

  return data;
}

export function logout() {
  clearToken();
}

// ---------------------
// Providers
// ---------------------
export async function listProviders(
  { page = 1, perPage = 8, search = "", status = "" } = {},
  signal
) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("per_page", String(perPage));
  if (search) qs.set("search", search);
  if (status) qs.set("status", status);
  return request(`/providers?${qs.toString()}`, { signal });
}

export async function createProvider(payload) {
  return request("/providers", { method: "POST", body: payload });
}

export async function updateProvider(id, payload) {
  return request(`/providers/${id}`, { method: "PUT", body: payload });
}

export async function deleteProvider(id) {
  return request(`/providers/${id}`, { method: "DELETE" });
}

// ---------------------
// Contacts
// ---------------------
export async function listContacts(providerId) {
  return request(`/providers/${providerId}/contacts`, { method: "GET" });
}

export async function createContact(providerId, payload) {
  return request(`/providers/${providerId}/contacts`, { method: "POST", body: payload });
}

export async function updateContact(contactId, payload) {
  return request(`/contacts/${contactId}`, { method: "PUT", body: payload });
}

export async function deleteContact(contactId) {
  return request(`/contacts/${contactId}`, { method: "DELETE" });
}
