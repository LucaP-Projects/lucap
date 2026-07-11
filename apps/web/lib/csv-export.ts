/**
 * Converts an array of objects to CSV string.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (rows.length === 0) return '';

  const cols = columns ?? Object.keys(rows[0] as object).map((k) => ({
    key: k as keyof T,
    label: k,
  }));

  const escape = (v: unknown): string => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = cols.map((c) => escape(c.label)).join(',');
  const body = rows
    .map((row) => cols.map((c) => escape(row[c.key])).join(','))
    .join('\n');

  return `${header}\n${body}`;
}

/**
 * Creates a Blob and triggers a download for a CSV file.
 */
export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
