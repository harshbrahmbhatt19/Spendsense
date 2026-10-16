// Minimal CSV writer - avoids pulling in a dependency for something this simple.
export const toCsv = (rows: Record<string, any>[]): string => {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
};
