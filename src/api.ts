// Vite forwards /api to Laravel during development (see vite.config.ts).
// Set VITE_API_URL if your API lives at a different address.
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("token");
  const headers = new Headers(options.headers);

  // Accept describes the response we want. Content-Type describes a body we send.
  headers.set("Accept", "application/json");

  if (token && endpoint !== "/login") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // await fetch waits for the response headers. Reading JSON is a separate await.
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && endpoint !== "/login") {
    sessionStorage.removeItem("token");
    // A full navigation resets all private React state after an expired token.
    window.location.replace("/login?expired=1");
    throw new Error("Your session has expired. Please log in again.");
  }

  // Fetch does NOT throw for 404, 422 or 500: we must check response.ok.
  if (!response.ok) {
    // A server may return HTML instead of JSON when something goes wrong.
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed (${response.status}).`);
  }

  // Return the Response so the caller decides whether to read JSON.
  // For example, a successful DELETE may return 204 with no body.
  return response;
}
