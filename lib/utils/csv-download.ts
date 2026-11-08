/**
 * Téléchargement d'un tableau en CSV (Excel FR : séparateur « ; », BOM UTF-8).
 * Les cellules qui commencent par = + - @ sont neutralisées (injection de formules dans Excel).
 */
export function toCsv(rows: Array<Record<string, string | number | null | undefined>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const cell = (value: string | number | null | undefined) => {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers.map(cell).join(';'), ...rows.map((row) => headers.map((h) => cell(row[h])).join(';'))].join('\r\n');
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>): void {
  const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
