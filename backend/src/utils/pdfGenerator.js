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
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #172033; background: #eef2f8; }
    .sheet { min-height: 1085px; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #e5eaf3; }
    .header { display: flex; justify-content: space-between; gap: 24px; padding: 30px 36px; color: #fff; background: linear-gradient(135deg, #17124a, #5521a6 70%, #7c2d12); }
    .brand { font-size: 30px; font-weight: 900; letter-spacing: .2px; }
    .muted-light { color: #d9e3ff; font-size: 12px; line-height: 1.5; margin-top: 7px; max-width: 380px; }
    .doc-title { text-align: right; font-size: 25px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .doc-pill { margin-top: 10px; display: inline-block; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22); font-size: 12px; }
    .content { padding: 28px 36px 34px; }
    .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
    .card { border: 1px solid #e5eaf3; border-radius: 14px; background: #f8fafc; padding: 16px; min-height: 104px; }
    .label { font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px; }
    .strong { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 5px; }
    .line { font-size: 12px; color: #475569; line-height: 1.45; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5eaf3; border-radius: 14px; overflow: hidden; }
    th { background: #111827; color: #fff; font-size: 10px; padding: 10px 8px; text-align: left; text-transform: uppercase; letter-spacing: .05em; }
    td { font-size: 11px; padding: 10px 8px; border-bottom: 1px solid #edf1f7; color: #1f2937; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:last-child td { border-bottom: none; }
    .right { text-align: right; }
    .item { font-weight: 700; color: #111827; }
    .totals-wrap { display: flex; justify-content: space-between; gap: 24px; margin-top: 24px; align-items: flex-start; }
    .terms { flex: 1; font-size: 11px; color: #475569; line-height: 1.5; }
    .totals { width: 320px; color: #fff; background: linear-gradient(135deg, #17124a, #5521a6); border-radius: 16px; padding: 16px; }
    .total-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 12px; color: #e5e7eb; }
    .grand { margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.22); font-size: 17px; font-weight: 900; color: #ffbf75; }
    .footer { margin-top: 34px; display: flex; justify-content: space-between; border-top: 1px solid #e5eaf3; padding-top: 18px; color: #64748b; font-size: 10px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">${escapeHtml(companySettings.name || 'Fusion Services')}</div>
        <div class="muted-light">${escapeHtml(companySettings.address || 'Address Not Provided').replace(/\n/g, '<br>')}<br>GSTIN: ${escapeHtml(companySettings.gstin || 'N/A')}</div>
      </div>
      <div>
        <div class="doc-title">${escapeHtml(docTitle)}</div>
        <div class="doc-pill">${escapeHtml(documentData.document_number || '-')} | ${escapeHtml(documentData.date || '-')}</div>
      </div>
    </div>
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
        'q', '0.10 0.12 0.28 rg', '0 735 595 107 re f', '0.42 0.21 0.86 rg', '0 735 180 107 re f', '1 1 1 rg',
        ...pdfText(companySettings.name || 'Fusion Services', 42, 800, 24, true),
        ...pdfText(companySettings.address || 'Professional Documents by FusionDocs', 42, 778, 9, false, 58),
        ...pdfText(`GSTIN: ${companySettings.gstin || 'N/A'}`, 42, 758, 9, false),
        ...pdfText(title.toUpperCase(), 390, 800, 18, true),
        ...pdfText(`${documentData.document_number || '-'} | ${documentData.date || '-'}`, 390, 776, 10, false),
        'Q',
        '0.98 0.98 1 rg', '38 626 250 82 re f', '0.93 0.94 0.98 RG', '38 626 250 82 re S',
        '0.14 0.16 0.26 rg', ...pdfText(isChallan ? 'SHIP TO' : 'BILLED TO', 54, 684, 9, true),
        ...pdfText(documentData.customer_name || '-', 54, 664, 14, true, 34),
        ...pdfText(isChallan ? (documentData.shipping_address || documentData.billing_address || '-') : (documentData.billing_address || '-'), 54, 646, 9, false, 42),
        ...pdfText(documentData.phone || '-', 54, 632, 9, false, 42),
        '0.98 0.98 1 rg', '307 626 250 82 re f', '0.93 0.94 0.98 RG', '307 626 250 82 re S',
        '0.14 0.16 0.26 rg', ...pdfText('DOCUMENT INFO', 323, 684, 9, true),
        ...pdfText(`No: ${documentData.document_number || '-'}`, 323, 664, 11, true),
        ...pdfText(`Type: ${title}`, 323, 646, 9, false), ...pdfText('Status: Saved', 323, 632, 9, false),
        '0.10 0.12 0.28 rg', '38 574 519 28 re f', '1 1 1 rg',
        ...pdfText('ITEM', 48, 592, 8, true), ...pdfText('HSN', 210, 592, 8, true), ...pdfText('QTY', 260, 592, 8, true),
        ...pdfText('RATE', 313, 592, 8, true), ...pdfText('GST', 372, 592, 8, true), ...pdfText('GST AMT', 420, 592, 8, true), ...pdfText('TOTAL', 500, 592, 8, true),
        ...fallbackRows(items, isChallan),
        ...(!isChallan ? fallbackTotals(documentData) : []),
        '0.14 0.16 0.26 rg', ...pdfText('Bank Details', 38, 142, 10, true), ...pdfText(companySettings.bank_details || 'N/A', 38, 126, 8, false, 52),
        ...pdfText('Terms', 38, 100, 10, true), ...pdfText(companySettings.terms || 'Payment as per agreed commercial terms.', 38, 84, 8, false, 58),
        '0.78 0.80 0.86 RG', '38 58 519 0.8 re S', '0.44 0.48 0.58 rg',
        ...pdfText('Generated securely by FusionDocs', 38, 38, 8, false), ...pdfText('Authorized Signatory', 430, 38, 8, true),
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
