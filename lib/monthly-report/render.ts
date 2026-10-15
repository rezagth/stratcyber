import { launchPdfBrowser } from '@/lib/pdf/launch-browser';
import { buildMonthlyReportHtml } from '@/lib/monthly-report/html';
import type { MonthlyReportData } from '@/lib/monthly-report/data';

/** Rend le rapport mensuel (module K) en PDF via un Chromium headless. */
export async function renderMonthlyReportPdf(data: MonthlyReportData): Promise<Buffer> {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(buildMonthlyReportHtml(data), { waitUntil: 'networkidle0' });
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
