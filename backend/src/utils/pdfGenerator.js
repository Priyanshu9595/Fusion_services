const fs = require('fs');
const path = require('path');

const generatePDF = async (documentData, companySettings = {}) => {
    const dir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${safeFileName(documentData.document_number || 'document')}.pdf`);

    try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {})
        });

        try {
            const page = await browser.newPage();
            await page.setContent(buildHtml(documentData, companySettings), { waitUntil: 'networkidle0' });
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true,
                margin: { top: '18px', right: '18px', bottom: '18px', left: '18px' }
            });
            return filePath;
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Puppeteer PDF generation failed, using fallback PDF:', error.message);
        fs.writeFileSync(filePath, buildFallbackPdf(documentData, companySettings));
        return filePath;
    }
};

const buildHtml = (documentData, companySettings) => {
    const isChallan = documentData.type === 'challan';
    const docTitle = getDocTitle(documentData.type);
    const items = documentData.items || [];

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #fff; }
    .sheet { min-height: 1085px; background: #fff; border: 1.5px solid #1f2937; }
    .header { padding: 24px 32px 18px; text-align: center; border-bottom: 2px solid #1f2937; }
    .brand { font-size: 29px; font-weight: 900; letter-spacing: .3px; color: #1e3a8a; text-transform: uppercase; }
    .muted-light { color: #374151; font-size: 11px; line-height: 1.45; margin-top: 6px; }
    .doc-title { text-align: center; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #111827; background: #eef2ff; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 10px; }
    .doc-pill { display: none; }
    .content { padding: 24px 32px 30px; }
    .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
    .card { border: 1px solid #cbd5e1; padding: 13px; min-height: 96px; }
    .label { font-size: 10px; font-weight: 800; color: #334155; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    .strong { font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 5px; }
    .line { font-size: 11px; color: #374151; line-height: 1.45; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #1f2937; }
    th { background: #f1f5f9; color: #111827; font-size: 10px; padding: 9px 7px; text-align: left; text-transform: uppercase; border: 1px solid #94a3b8; }
    td { font-size: 10.5px; padding: 8px 7px; border: 1px solid #cbd5e1; color: #111827; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    .right { text-align: right; }
    .item { font-weight: 700; color: #111827; }
    .totals-wrap { display: flex; justify-content: space-between; gap: 24px; margin-top: 22px; align-items: flex-start; }
    .terms { flex: 1; font-size: 10.5px; color: #374151; line-height: 1.5; border: 1px solid #cbd5e1; padding: 12px; min-height: 96px; }
    .totals { width: 300px; border: 1px solid #1f2937; }
    .total-row { display: flex; justify-content: space-between; padding: 9px 11px; font-size: 11px; color: #111827; border-bottom: 1px solid #cbd5e1; }
    .grand { border-bottom: 0; font-size: 15px; font-weight: 900; background: #eef2ff; color: #1e3a8a; }
    .footer { margin-top: 42px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 18px; color: #475569; font-size: 10px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">${escapeHtml(companySettings.name || 'Fusion Services')}</div>
        <div class="muted-light">${escapeHtml(companySettings.address || 'Address Not Provided').replace(/\n/g, '<br>')}<br>GSTIN: ${escapeHtml(companySettings.gstin || 'N/A')}</div>
      </div>
    </div>
    <div class="doc-title">${escapeHtml(docTitle)}</div>
    <div class="content">
      <div class="cards">
        <div class="card">
          <div class="label">${isChallan ? 'Shipping To' : 'Billed To'}</div>
          <div class="strong">${escapeHtml(documentData.customer_name || '-')}</div>
          <div class="line">${escapeHtml(isChallan ? (documentData.shipping_address || documentData.billing_address || '-') : (documentData.billing_address || '-'))}</div>
          ${!isChallan ? `<div class="line">GSTIN: ${escapeHtml(documentData.customer_gstin || 'N/A')}</div>` : ''}
          ${documentData.phone ? `<div class="line">Phone: ${escapeHtml(documentData.phone)}</div>` : ''}
        </div>
        <div class="card">
          <div class="label">Document Info</div>
          <div class="strong">${escapeHtml(documentData.document_number || '-')}</div>
          <div class="line">Date: ${escapeHtml(documentData.date || '-')}</div>
          <div class="line">Status: ${escapeHtml(documentData.status || 'Saved')}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:32px">#</th>
            <th>Item</th>
            <th>HSN</th>
            <th>Qty</th>
            ${isChallan ? '' : '<th class="right">Rate</th><th class="right">GST</th><th class="right">GST Amt</th><th class="right">Final Total</th>'}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => buildHtmlRow(item, index, isChallan)).join('')}
        </tbody>
      </table>
      ${isChallan ? '' : `
      <div class="totals-wrap">
        <div class="terms">
          <strong>Bank Details</strong><br>${escapeHtml(companySettings.bank_details || 'N/A').replace(/\n/g, '<br>')}<br><br>
          <strong>Terms & Conditions</strong><br>${escapeHtml(companySettings.terms || 'Payment as per agreed commercial terms.').replace(/\n/g, '<br>')}
        </div>
        <div class="totals">
          <div class="total-row"><span>Subtotal</span><strong>${money(documentData.subtotal)}</strong></div>
          <div class="total-row"><span>Total GST</span><strong>${money(documentData.total_gst)}</strong></div>
          <div class="total-row grand"><span>Grand Total</span><span>${money(documentData.grand_total)}</span></div>
        </div>
      </div>`}
      <div class="footer">
        <span>Generated securely by FusionDocs</span>
        <strong>Authorized Signatory</strong>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const buildHtmlRow = (item, index, isChallan) => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.unit_price || 0);
    const gstPercent = Number(item.gst_percent || 0);
    const subtotal = qty * rate;
    const gstAmount = Number(item.line_gst_amount || ((subtotal * gstPercent) / 100));
    const total = Number(item.line_total || (subtotal + gstAmount));

    return `<tr>
      <td>${index + 1}</td>
      <td class="item">${escapeHtml(item.item_name || '-')}</td>
      <td>${escapeHtml(item.hsn || '-')}</td>
      <td>${qty} ${escapeHtml(item.unit || '')}</td>
      ${isChallan ? '' : `<td class="right">${money(rate)}</td><td class="right">${gstPercent}%</td><td class="right">${money(gstAmount)}</td><td class="right"><strong>${money(total)}</strong></td>`}
    </tr>`;
};

const buildFallbackPdf = (documentData, companySettings) => {
    const isChallan = documentData.type === 'challan';
    const title = getDocTitle(documentData.type);
    const items = (documentData.items || []).slice(0, 12);
    const content = [
        '0.12 0.16 0.24 RG', '30 30 535 780 re S',
        '0.12 0.16 0.24 rg',
        ...pdfText(companySettings.name || 'Fusion Services', 188, 800, 22, true),
        ...pdfText(companySettings.address || 'Address Not Provided', 118, 778, 9, false, 58),
        ...pdfText(`GSTIN: ${companySettings.gstin || 'N/A'}`, 230, 762, 9, false),
        '0.12 0.16 0.24 RG', '30 744 535 0.8 re S',
        '0.93 0.95 1 rg', '30 706 535 28 re f',
        '0.12 0.16 0.24 rg', ...pdfText(title.toUpperCase(), 250, 724, 14, true),
        '0.12 0.16 0.24 RG', '30 706 535 28 re S',
        '0.99 0.99 1 rg', '42 604 242 82 re f', '0.70 0.75 0.84 RG', '42 604 242 82 re S',
        '0.12 0.16 0.24 rg', ...pdfText(isChallan ? 'SHIP TO' : 'BILLED TO', 56, 666, 9, true),
        ...pdfText(documentData.customer_name || '-', 56, 648, 13, true, 34),
        ...pdfText(isChallan ? (documentData.shipping_address || documentData.billing_address || '-') : (documentData.billing_address || '-'), 56, 630, 9, false, 40),
        ...pdfText(documentData.phone || '-', 56, 616, 9, false, 40),
        '0.99 0.99 1 rg', '311 604 242 82 re f', '0.70 0.75 0.84 RG', '311 604 242 82 re S',
        '0.12 0.16 0.24 rg', ...pdfText('DOCUMENT INFO', 325, 666, 9, true),
        ...pdfText(`No: ${documentData.document_number || '-'}`, 325, 648, 11, true),
        ...pdfText(`Date: ${documentData.date || '-'}`, 325, 630, 9, false), ...pdfText('Status: Saved', 325, 616, 9, false),
        '0.93 0.95 1 rg', '42 558 511 26 re f', '0.12 0.16 0.24 RG', '42 558 511 26 re S',
        '0.12 0.16 0.24 rg',
        ...pdfText('ITEM', 52, 575, 8, true), ...pdfText('HSN', 208, 575, 8, true), ...pdfText('QTY', 258, 575, 8, true),
        ...pdfText('RATE', 310, 575, 8, true), ...pdfText('GST', 370, 575, 8, true), ...pdfText('GST AMT', 418, 575, 8, true), ...pdfText('TOTAL', 498, 575, 8, true),
        ...fallbackRows(items, isChallan),
        ...(!isChallan ? fallbackTotals(documentData) : []),
        '0.12 0.16 0.24 rg', ...pdfText('Bank Details', 42, 136, 10, true), ...pdfText(companySettings.bank_details || 'N/A', 42, 120, 8, false, 52),
        ...pdfText('Terms', 42, 94, 10, true), ...pdfText(companySettings.terms || 'Payment as per agreed commercial terms.', 42, 78, 8, false, 58),
        '0.70 0.75 0.84 RG', '42 58 511 0.8 re S', '0.32 0.36 0.45 rg',
        ...pdfText('Generated securely by FusionDocs', 42, 38, 8, false), ...pdfText('Authorized Signatory', 430, 38, 8, true),
    ].join('\n');
    return writePdf(content);
};

const fallbackRows = (items, isChallan) => {
    const commands = [];
    let y = 545;
    items.forEach((item, index) => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.unit_price || 0);
        const gstPercent = Number(item.gst_percent || 0);
        const subtotal = qty * rate;
        const gstAmount = Number(item.line_gst_amount || ((subtotal * gstPercent) / 100));
        const total = Number(item.line_total || (subtotal + gstAmount));
        if (index % 2 === 0) commands.push('0.985 0.988 1 rg', `38 ${y - 16} 519 30 re f`);
        commands.push(
            '0.14 0.16 0.26 rg',
            ...pdfText(truncate(item.item_name || '-', 27), 48, y, 8.5, true),
            ...pdfText(item.hsn || '-', 210, y, 8, false),
            ...pdfText(`${qty} ${item.unit || ''}`.trim(), 260, y, 8, false),
            ...pdfText(isChallan ? '-' : money(rate), 313, y, 8, false),
            ...pdfText(isChallan ? '-' : `${gstPercent}%`, 372, y, 8, false),
            ...pdfText(isChallan ? '-' : money(gstAmount), 420, y, 8, false),
            ...pdfText(isChallan ? '-' : money(total), 500, y, 8, true)
        );
        y -= 32;
    });
    return commands;
};

const fallbackTotals = (documentData) => ([
    '0.10 0.12 0.28 rg', '340 164 217 98 re f', '1 1 1 rg',
    ...pdfText('Subtotal', 360, 235, 9, false), ...pdfText(money(documentData.subtotal), 475, 235, 9, true),
    ...pdfText('Total GST', 360, 213, 9, false), ...pdfText(money(documentData.total_gst), 475, 213, 9, true),
    '1.00 0.68 0.32 rg', ...pdfText('Grand Total', 360, 186, 12, true), ...pdfText(money(documentData.grand_total), 467, 186, 13, true),
]);

const getDocTitle = (type) => type === 'invoice' ? 'Tax Invoice' : type === 'quote' ? 'Quotation' : 'Delivery Challan';
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const safeFileName = (value) => String(value).replace(/[^a-z0-9_.-]/gi, '_');
const truncate = (value, maxLength) => String(value || '').length > maxLength ? `${String(value).slice(0, maxLength - 3)}...` : String(value || '');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const escapePdfText = (value) => String(value ?? '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const pdfText = (value, x, y, size = 10, bold = false, maxLength = 68) => {
    const font = bold ? '/F2' : '/F1';
    return ['BT', `${font} ${size} Tf`, `${x} ${y} Td`, `(${escapePdfText(truncate(value, maxLength))}) Tj`, 'ET'];
};

const writePdf = (content) => {
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf));
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
};

module.exports = { generatePDF };
