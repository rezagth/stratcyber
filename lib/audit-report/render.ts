import { launchPdfBrowser } from '@/lib/pdf/launch-browser';
import { buildAuditReportHtml } from '@/lib/audit-report/html';
import type { AuditReportData } from '@/lib/audit-report/data';

/** Rend le rapport d'audit en PDF via un Chromium headless. */
export async function renderAuditReportPdf(data: AuditReportData, summary: string[] = []): Promise<Buffer> {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(buildAuditReportHtml(data, summary), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
