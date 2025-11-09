// ui/echartsHelpers.ts
export const formatWeeklyXAxisLabel = (
  value: string,
  currentGrouping: string
) => {
  if (currentGrouping !== "weekly") return value;

  const [yearStr, weekStr] = value.split("-");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  if (!year || !week) return value;

  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7 - ((jan1.getDay() + 6) % 7);
  const weekStart = new Date(jan1.getTime() + daysOffset * 86400000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

  const format = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const humanRange = `${format(weekStart)} – ${format(weekEnd)}`;
  return ["{a|" + value + "}", "{b|" + humanRange + "}"].join("\n");
};
