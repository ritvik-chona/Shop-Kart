// Shared display helpers. Kept out of component files so a fast-refresh
// reload of a component does not have to re-evaluate them.
export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatRupees = (value) => value.toLocaleString("en-IN");
