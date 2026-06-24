export const getEventStatus = (event) => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
};

// Currently unused directly (badges use the inline S.badge() color map instead),
// kept here in case you want status-driven theming elsewhere.
export const STATUS_COLORS = {
  active: { bg: "#6C5CE7", text: "#fff" },
  upcoming: { bg: "#f1f3f5", text: "#555" },
  completed: { bg: "#e9ecef", text: "#888" },
};
