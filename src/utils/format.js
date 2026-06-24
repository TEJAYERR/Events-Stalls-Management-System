export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export const formatCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
