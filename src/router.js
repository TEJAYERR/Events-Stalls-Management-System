// ─── ROUTER ────────────────────────────────────────────────────────────────
// Minimal path-based switch: /event/:id is the public booking page,
// everything else falls through to the admin app.
export function getRoute() {
  const path = window.location.pathname;
  const match = path.match(/^\/event\/([^/]+)/);
  if (match) return { type: "public", eventId: match[1] };
  return { type: "admin" };
}
