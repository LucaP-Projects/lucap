'use server';

import { readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
handlebars.registerHelper('add', function (a, b) {
  return a + b;
});

handlebars.registerHelper('format', function (number) {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

handlebars.registerHelper('multiply', function (a, b) {
  return a * b;
});
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

handlebars.registerHelper('subtract', function (a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') return 0;
  return Math.abs(a - b);
});
handlebars.registerHelper('or', function (a, b) {
  return a || b;
});

// Map paper types to template filenames
const paperTemplateMap: Record<string, string> = {
  invoice: 'invoice.html',
  'delayed credit': 'delayed-credit.html',
  'delayed charge': 'delayed-charges.html',
  estimate: 'estimate.html',
  'sales receipt': 'sales-receipt.html',
  'refund receipt': 'refund-receipt.html',
  'credit memo': 'credit-memo.html'
};

export async function generatePdf({
  formData,
  company,
  color,
  colorLight,
  settings,
  note,
  taxRate,
  subtotal,
  discountAmount,
  total,
  paperType = 'invoice'
}: any) {
  try {
    const templateFileName =
      paperTemplateMap[paperType.toLowerCase()] || 'invoice.html';

    const templatePath = join(
      process.cwd(),
      'public/templates',
      templateFileName
    );
    const template = readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);

    const data = {
      company,
      color,
      colorLight,
      settings,
      note,
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: format(new Date(), 'MM/dd/yyyy'),
      dueDate: formData.dueDate
        ? format(new Date(formData.dueDate), 'MM/dd/yyyy')
        : '',
      items: formData.items,
      customerAddress: formData.customerAddress,
      emailCustomer: formData.emailCustomer,
      subtotal,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      discountAmount,
      taxRate,
      taxAmount: total - subtotal + discountAmount,
      total,
      paperType // Include paper type in the data
    };

    // Generate HTML from template
    const html = compiledTemplate({ data });

    // Launch browser and create PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        bottom: '1.5cm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="
          font-family: Arial;
          font-size: 8pt;
          color: #666;
          text-align: center;
          width: 100%;
          padding-top: 10pt;
        ">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: true,
      scale: 1
    });

    await browser.close();
    const base64Pdf = Buffer.from(pdf).toString('base64')
    return base64Pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed', { cause: error });
  }
}
