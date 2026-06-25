// ─── CONFIG ────────────────────────────────────────────────────────────────
// TODO: move to an env var (e.g. import.meta.env.VITE_API_BASE_URL) once you
// wire this up to your build tool, instead of hardcoding localhost.
export const BASE_URL = "https://esm-backend-1k9u.onrender.com";

// ─── API ───────────────────────────────────────────────────────────────────
// Single low-level request helper + one named method per backend endpoint.
// Add any new backend endpoints here so every page/component keeps calling
// through this one module instead of touching fetch() directly.
export const api = {
  async request(method, path, body, token, isMultipart) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!isMultipart) headers["Content-Type"] = "application/json";
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}`);
      } catch (e) {
        throw new Error(e.message || `HTTP ${res.status}`);
      }
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    if (ct.includes("image") || ct.includes("octet")) return res.blob();
    return res.text();
  },

  // Auth
  login: (body) => api.request("POST", "/admin/login", body),

  // Events
  getEvents: (token) => api.request("GET", "/admin/events", null, token),
  // Admin-authenticated single-event fetch — now a dedicated admin endpoint,
  // separate from the public one below (was reusing /events/{id} before).
  getEvent: (id, token) => api.request("GET", `/admin/events/${id}`, null, token),
  getPublicEvent: (id) => api.request("GET", `/events/${id}`),
  createEvent: (form, token) => api.request("POST", "/admin/events", form, token, true),
  updateEvent: (id, body, token) => api.request("PATCH", `/admin/events/${id}`, body, token),
  deleteEvent: (id, token) => api.request("DELETE", `/admin/events/${id}`, null, token),
  updateBlueprint: (id, form, token) => api.request("PATCH", `/admin/events/${id}/blueprint`, form, token, true),
  getBlueprintUrl: (id) => `${BASE_URL}/events/${id}/blueprint`,

  // Stalls
  addStall: (eventId, body, token) => api.request("POST", `/admin/events/${eventId}/stalls`, body, token),
  updateStall: (eventId, stallId, body, token) => api.request("PATCH", `/admin/events/${eventId}/stalls/${stallId}`, body, token),
  deleteStall: (eventId, stallId, token) => api.request("DELETE", `/admin/events/${eventId}/stalls/${stallId}`, null, token),

  // Bookings
  getBookings: (status, search, token) => api.request("GET", `/admin/bookings?bookingStatus=${status}${search ? `&searchKeyword=${encodeURIComponent(search)}` : ""}`, null, token),
  updateBooking: (id, body, token) => api.request("PATCH", `/admin/booking/${id}`, body, token),
  bookStall: (eventId, stallId, body) => api.request("POST", `/events/${eventId}/stalls/${stallId}/book`, body),
  verifyPayment: (eventId, stallId, body) => api.request("POST", `/events/${eventId}/stalls/${stallId}/book/verify-payment`, body),
};
