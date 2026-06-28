export const getEventStatus = (event) => {
  const status = event.eventStatus;
  if (status === 'OPEN') return "open";
  return "closed";
};

// Currently unused directly (badges use the inline S.badge() color map instead),
// kept here in case you want status-driven theming elsewhere.
export const STATUS_COLORS = {
  open: { bg: "#6C5CE7", text: "#fff" },
  closed: { bg: "#f1f3f5", text: "#555" },
};
