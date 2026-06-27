const fs = require('fs');
const path = require('path');

const generatePDF = async (documentData, companySettings = {}) => {
    const normalized = normalizeDocumentData(documentData, companySettings);
    const dir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${safeFileName(normalized.documentNumber || 'document')}.pdf`);

    try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {})
        });

        try {
            const page = await browser.newPage();
            await page.setContent(buildHtml(normalized), { waitUntil: 'networkidle0' });
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true,
                margin: { top: '16mm', right: '14mm', bottom: '14mm', left: '14mm' }
            });
            return filePath;
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Puppeteer PDF generation failed, using fallback PDF:', error.message);
        fs.writeFileSync(filePath, buildFallbackPdf(normalized));
        return filePath;
    }
};

const normalizeDocumentData = (documentData = {}, companySettings = {}) => {
    const documentType = normalizeDocumentType(documentData.documentType || documentData.type);
    const isChallan = documentType === 'challan';
    const products = (documentData.products || documentData.items || []).map((item, index) => normalizeProduct(item, index, isChallan));
    const computedTotals = calculateTotals(products, isChallan);

    return {
        company: {
            name: cleanValue(documentData.company?.name || companySettings.name || 'Fusion Services'),
            address: cleanValue(documentData.company?.address || companySettings.address || 'Address Not Provided'),
            gstin: cleanValue(documentData.company?.gstin || companySettings.gstin || 'N/A'),
            bankDetails: cleanValue(documentData.company?.bankDetails || companySettings.bank_details || 'N/A'),
            terms: cleanValue(documentData.company?.terms || companySettings.terms || 'Payment as per agreed commercial terms.')
        },
        customer: {
            name: cleanValue(documentData.customer?.name || documentData.customer_name || '-'),
            address: cleanValue(documentData.customer?.address || documentData.billing_address || documentData.shipping_address || '-'),
            shippingAddress: cleanValue(documentData.customer?.shippingAddress || documentData.shipping_address || documentData.billing_address || '-'),
            gstin: cleanValue(documentData.customer?.gstin || documentData.customer_gstin || 'N/A'),
            phone: cleanValue(documentData.customer?.phone || documentData.phone || '-')
        },
        documentType,
        documentNumber: cleanValue(documentData.documentNumber || documentData.document_number || '-'),
        date: cleanValue(documentData.date || new Date().toISOString().slice(0, 10)),
        status: cleanValue(documentData.status || 'Saved'),
        products,
        totals: {
            subtotal: computedTotals.subtotal,
            totalGST: computedTotals.totalGST,
            grandTotal: computedTotals.grandTotal
        }
    };
};

const normalizeProduct = (item = {}, index, isChallan) => {
    const quantity = toNumber(item.quantity ?? item.qty, 0);
    const unitPrice = toNumber(item.unitPrice ?? item.unit_price, 0);
    const gstRate = normalizeGstRate(item.gstRate ?? item.gst_percent, isChallan);
    const taxableAmount = round2(quantity * unitPrice);
    const gstAmount = round2(taxableAmount * gstRate / 100);
    const lineTotal = round2(taxableAmount + gstAmount);

    return {
        index: index + 1,
        itemName: cleanValue(item.itemName || item.item_name || item.name || '-'),
        hsnCode: cleanValue(item.hsnCode || item.hsn || '-'),
        quantity,
        unit: cleanValue(item.unit || 'Nos'),
        unitPrice,
        gstRate,
        taxableAmount: pickNumber(item.taxableAmount, item.line_subtotal, taxableAmount),
        gstAmount: pickNumber(item.gstAmount, item.line_gst_amount, gstAmount),
        lineTotal: pickNumber(item.lineTotal, item.line_total, lineTotal),
        remarks: cleanValue(item.remarks || item.description || '-')
    };
};

const calculateTotals = (products, isChallan) => {
    if (isChallan) return { subtotal: 0, totalGST: 0, grandTotal: 0 };

    return products.reduce((totals, product) => ({
        subtotal: round2(totals.subtotal + product.taxableAmount),
        totalGST: round2(totals.totalGST + product.gstAmount),
        grandTotal: round2(totals.grandTotal + product.lineTotal)
    }), { subtotal: 0, totalGST: 0, grandTotal: 0 });
};

const buildHtml = (documentData) => {
    const meta = getDocMeta(documentData.documentType);
    const isChallan = documentData.documentType === 'challan';
    const customerAddress = isChallan ? documentData.customer.shippingAddress : documentData.customer.address;

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 16mm 14mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #172033;
      background: #fff;
      font-family: "DejaVu Sans", "Noto Sans", Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.45;
    }
    .document { width: 100%; background: #fff; }
    .header { text-align: center; padding-bottom: 13px; border-bottom: 3px solid #2563eb; }
    .company-name { margin: 0; color: #1d4ed8; font-size: 28px; font-weight: 800; letter-spacing: .2px; }
    .company-meta { margin-top: 5px; color: #475569; font-size: 10.5px; }
    .title { margin: 14px 0 18px; text-align: center; color: #0f172a; font-size: 18px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; }
    .top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
    .info-card { border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: #fff; }
    .card-label { padding: 8px 11px; background: #f1f5f9; color: #1d4ed8; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid #dbe4f0; }
    .card-body { padding: 11px; min-height: 92px; }
    .customer-name, .doc-number { color: #0f172a; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
    .detail-line { color: #334155; margin-top: 3px; overflow-wrap: anywhere; }
    .section-title { margin: 17px 0 10px; color: #0f172a; font-size: 13px; font-weight: 800; }
    .product-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 0 10px;
      background: #fff;
    }
    .product-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 9px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .product-index { color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    .product-name { color: #0f172a; font-size: 13px; font-weight: 800; text-align: right; overflow-wrap: anywhere; }
    .product-body { padding: 10px 12px 12px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; row-gap: 6px; }
    .field { display: grid; grid-template-columns: 112px 1fr; gap: 8px; align-items: baseline; min-width: 0; }
    .field .label { color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .field .value { color: #111827; font-size: 11.5px; overflow-wrap: anywhere; }
    .amount .value { text-align: right; font-variant-numeric: tabular-nums; }
    .line-total .value { color: #0f172a; font-size: 13px; font-weight: 900; }
    .summary-row { display: flex; justify-content: flex-end; margin-top: 18px; page-break-inside: avoid; break-inside: avoid; }
    .summary-card { width: 310px; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: #fff; }
    .summary-card .card-label { color: #0f172a; }
    .total-line { display: flex; justify-content: space-between; gap: 14px; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .total-line strong { color: #0f172a; font-variant-numeric: tabular-nums; }
    .grand-total { background: #eff6ff; color: #1d4ed8; font-size: 15px; font-weight: 900; border-bottom: 0; }
    .grand-total strong { color: #1d4ed8; font-size: 17px; }
    .business-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; page-break-inside: avoid; break-inside: avoid; }
    .note-box { border: 1px solid #dbe4f0; border-radius: 10px; padding: 10px 12px; color: #334155; min-height: 72px; }
    .note-title { color: #0f172a; font-weight: 800; margin-bottom: 4px; }
    .signature { display: flex; justify-content: flex-end; margin-top: 34px; page-break-inside: avoid; break-inside: avoid; }
    .signature-box { width: 230px; padding-top: 26px; border-top: 1px solid #94a3b8; text-align: center; color: #0f172a; font-weight: 800; }
    .signature-box span { display: block; margin-top: 4px; color: #475569; font-size: 10.5px; font-weight: 700; }
    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 10px; }
  </style>
</head>
<body>
  <main class="document">
    <header class="header">
      <h1 class="company-name">${escapeHtml(documentData.company.name)}</h1>
      <div class="company-meta">
        ${multiline(documentData.company.address)}<br>
        GSTIN: ${escapeHtml(documentData.company.gstin)}
      </div>
    </header>

    <div class="title">${escapeHtml(meta.title)}</div>

    <section class="top-grid">
      <div class="info-card">
        <div class="card-label">${isChallan ? 'Ship To' : 'Billed To'}</div>
        <div class="card-body">
          <div class="customer-name">${escapeHtml(documentData.customer.name)}</div>
          <div class="detail-line">Address: ${escapeHtml(customerAddress)}</div>
          ${isChallan ? '' : `<div class="detail-line">GSTIN: ${escapeHtml(documentData.customer.gstin)}</div>`}
          <div class="detail-line">Phone: ${escapeHtml(documentData.customer.phone)}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-label">Document Details</div>
        <div class="card-body">
          <div class="doc-number">${escapeHtml(meta.numberLabel)}: ${escapeHtml(documentData.documentNumber)}</div>
          <div class="detail-line">Date: ${escapeHtml(documentData.date)}</div>
        </div>
      </div>
    </section>

    <section>
      <div class="section-title">Products</div>
      ${documentData.products.map(product => buildProductCard(product, isChallan)).join('')}
    </section>

    ${isChallan ? '' : buildSummary(documentData)}

    ${isChallan ? '' : `
    <section class="business-notes">
      <div class="note-box">
        <div class="note-title">Bank Details</div>
        ${multiline(documentData.company.bankDetails)}
      </div>
      <div class="note-box">
        <div class="note-title">Terms & Conditions</div>
        ${multiline(documentData.company.terms)}
      </div>
    </section>`}

    <section class="signature">
      <div class="signature-box">
        Authorized Signatory
        <span>For Fusion Services</span>
      </div>
    </section>

    <footer class="footer">Generated securely by FusionDocs</footer>
  </main>
</body>
</html>`;
};

const buildProductCard = (product, isChallan) => {
    if (isChallan) {
        return `<article class="product-card">
          <div class="product-head">
            <div class="product-index">Product #${product.index}</div>
            <div class="product-name">${escapeHtml(product.itemName)}</div>
          </div>
          <div class="product-body">
            <div class="product-grid">
              ${field('Item Name', product.itemName)}
              ${field('HSN Code', product.hsnCode)}
              ${field('Quantity', `${formatQty(product.quantity)} ${product.unit}`)}
              ${field('Unit', product.unit)}
              ${field('Remarks', product.remarks)}
            </div>
          </div>
        </article>`;
    }

    return `<article class="product-card">
      <div class="product-head">
        <div class="product-index">Product #${product.index}</div>
        <div class="product-name">${escapeHtml(product.itemName)}</div>
      </div>
      <div class="product-body">
        <div class="product-grid">
          ${field('Item Name', product.itemName)}
          ${field('HSN Code', product.hsnCode)}
          ${field('Quantity', `${formatQty(product.quantity)} ${product.unit}`)}
          ${field('Unit Price', money(product.unitPrice), true)}
          ${field('GST Rate', `${formatQty(product.gstRate)}%`, true)}
          ${field('Taxable Amount', money(product.taxableAmount), true)}
          ${field('GST Amount', money(product.gstAmount), true)}
          ${field('Line Total', money(product.lineTotal), true, 'line-total')}
        </div>
      </div>
    </article>`;
};

const field = (label, value, amount = false, extraClass = '') => `
  <div class="field ${amount ? 'amount' : ''} ${extraClass}">
    <div class="label">${escapeHtml(label)}</div>
    <div class="value">${escapeHtml(cleanValue(value))}</div>
  </div>`;

const buildSummary = (documentData) => `
  <section class="summary-row">
    <div class="summary-card">
      <div class="card-label">Total Summary</div>
      <div class="total-line"><span>Subtotal</span><strong>${money(documentData.totals.subtotal)}</strong></div>
      <div class="total-line"><span>Total GST</span><strong>${money(documentData.totals.totalGST)}</strong></div>
      <div class="total-line grand-total"><span>Grand Total</span><strong>${money(documentData.totals.grandTotal)}</strong></div>
    </div>
  </section>`;

const buildFallbackPdf = (documentData) => {
    const meta = getDocMeta(documentData.documentType);
    const isChallan = documentData.documentType === 'challan';
    const pages = [];
    let page = fallbackPageHeader(documentData, meta, isChallan, true);
    let y = 582;

    documentData.products.forEach((product) => {
        if (y - 76 < 112) {
            pages.push(finishFallbackPage(page, pages.length + 1, false));
            page = fallbackPageHeader(documentData, meta, isChallan, false);
            y = 690;
        }

        page.push(...fallbackProductCard(product, isChallan, y));
        y -= 86;
    });

    if (!isChallan) {
        if (y - 96 < 112) {
            pages.push(finishFallbackPage(page, pages.length + 1, false));
            page = fallbackPageHeader(documentData, meta, isChallan, false);
            y = 690;
        }
        page.push(...fallbackTotals(documentData.totals, y - 8));
        y -= 112;
    }

    if (y < 112) {
        pages.push(finishFallbackPage(page, pages.length + 1, false));
        page = fallbackPageHeader(documentData, meta, isChallan, false);
    }

    pages.push(finishFallbackPage(page, pages.length + 1, true));
    return writePdfPages(pages);
};

const fallbackPageHeader = (documentData, meta, isChallan, includeCustomerCards) => {
    const commands = [
        '0.10 0.25 0.55 rg',
        ...pdfText(documentData.company.name, 210, 802, 22, true, 42),
        '0.27 0.34 0.43 rg',
        ...pdfText(documentData.company.address, 92, 780, 8, false, 70),
        ...pdfText(`GSTIN: ${documentData.company.gstin}`, 230, 766, 8, false, 35),
        '0.15 0.39 0.92 RG', '42 752 511 2 re S',
        '0.05 0.09 0.16 rg',
        ...pdfText(meta.title, 230, 728, 15, true, 30)
    ];

    if (!includeCustomerCards) {
        commands.push(
            '0.10 0.25 0.55 rg',
            ...pdfText('Products Continued', 42, 704, 10, true)
        );
        return commands;
    }

    commands.push(
        '0.98 0.99 1 rg', '42 620 242 82 re f', '0.72 0.78 0.86 RG', '42 620 242 82 re S',
        '0.10 0.25 0.55 rg', ...pdfText(isChallan ? 'SHIP TO' : 'BILLED TO', 56, 682, 9, true),
        '0.05 0.09 0.16 rg', ...pdfText(documentData.customer.name, 56, 662, 12, true, 34),
        ...pdfText(isChallan ? documentData.customer.shippingAddress : documentData.customer.address, 56, 645, 8, false, 42),
        ...pdfText(`GSTIN: ${isChallan ? 'N/A' : documentData.customer.gstin}`, 56, 631, 8, false, 38),
        ...pdfText(`Phone: ${documentData.customer.phone}`, 56, 617, 8, false, 38),
        '0.98 0.99 1 rg', '311 620 242 82 re f', '0.72 0.78 0.86 RG', '311 620 242 82 re S',
        '0.10 0.25 0.55 rg', ...pdfText('DOCUMENT DETAILS', 325, 682, 9, true),
        '0.05 0.09 0.16 rg', ...pdfText(`${meta.numberLabel}: ${documentData.documentNumber}`, 325, 662, 11, true),
        ...pdfText(`Date: ${documentData.date}`, 325, 645, 8, false)
    );

    return commands;
};

const fallbackProductCard = (product, isChallan, y) => {
    const commands = [
        '0.99 0.99 1 rg', `42 ${y - 72} 511 72 re f`,
        '0.72 0.78 0.86 RG', `42 ${y - 72} 511 72 re S`,
        '0.95 0.97 1 rg', `42 ${y - 22} 511 22 re f`,
        '0.10 0.25 0.55 rg', ...pdfText(`Product #${product.index}`, 54, y - 8, 8, true),
        '0.05 0.09 0.16 rg', ...pdfText(product.itemName, 132, y - 8, 9, true, 56),
        ...pdfText(`HSN Code: ${product.hsnCode}`, 54, y - 36, 8, false),
        ...pdfText(`Quantity: ${formatQty(product.quantity)} ${product.unit}`, 54, y - 52, 8, false)
    ];

    if (isChallan) {
        commands.push(...pdfText(`Remarks: ${product.remarks}`, 270, y - 36, 8, false, 36));
    } else {
        commands.push(
            ...pdfText(`Unit Price: ${pdfMoney(product.unitPrice)}`, 270, y - 36, 8, false, 36),
            ...pdfText(`GST Rate: ${formatQty(product.gstRate)}%`, 270, y - 52, 8, false, 28),
            ...pdfText(`Taxable: ${pdfMoney(product.taxableAmount)}`, 392, y - 36, 8, false, 30),
            ...pdfText(`Line Total: ${pdfMoney(product.lineTotal)}`, 392, y - 52, 8, true, 30)
        );
    }

    return commands;
};

const fallbackTotals = (totals, topY) => {
    const y = Math.max(topY, 206);
    return [
        '0.96 0.98 1 rg', `332 ${y - 82} 221 82 re f`, '0.72 0.78 0.86 RG', `332 ${y - 82} 221 82 re S`,
        '0.05 0.09 0.16 rg',
        ...pdfText('Subtotal', 350, y - 22, 8, false), ...pdfText(pdfMoney(totals.subtotal), 452, y - 22, 8, true),
        ...pdfText('Total GST', 350, y - 42, 8, false), ...pdfText(pdfMoney(totals.totalGST), 452, y - 42, 8, true),
        '0.10 0.25 0.55 rg',
        ...pdfText('Grand Total', 350, y - 66, 10, true), ...pdfText(pdfMoney(totals.grandTotal), 440, y - 66, 10, true),
    ];
};

const finishFallbackPage = (commands, pageNumber, includeSignature) => {
    const footer = [
        '0.40 0.45 0.52 rg',
        ...pdfText('Generated securely by FusionDocs', 210, 28, 8, false),
        ...pdfText(`Page ${pageNumber}`, 516, 28, 8, false)
    ];

    if (includeSignature) {
        footer.unshift(
            '0.45 0.50 0.58 RG', '390 78 150 0.8 re S',
            '0.05 0.09 0.16 rg', ...pdfText('Authorized Signatory', 414, 62, 9, true),
            ...pdfText('For Fusion Services', 426, 48, 8, false)
        );
    }

    return [...commands, ...footer].join('\n');
};

const sampleDocumentData = {
    company: {
        name: 'Fusion Services',
        address: 'Plot No. 24, Industrial Area, Hyderabad, Telangana',
        gstin: '36ABCDE1234F1Z5',
        bankDetails: 'Bank: HDFC Bank\nA/C No: 1234567890\nIFSC: HDFC0001234',
        terms: 'Payment due as per agreed terms. Goods once sold will not be returned.'
    },
    customer: {
        name: 'ABC Manufacturing Pvt Ltd',
        address: 'Sector 12, Balanagar, Hyderabad',
        gstin: '36AABCA1234A1Z1',
        phone: '9876543210'
    },
    documentType: 'quotation',
    documentNumber: 'QT-SAMPLE-001',
    date: '2026-06-27',
    products: [
        { itemName: 'Industrial Bearing Set', hsnCode: '8482', quantity: 2, unit: 'Nos', unitPrice: 1000, gstRate: 5 },
        { itemName: 'Safety Control Cable', hsnCode: '8544', quantity: 5, unit: 'Roll', unitPrice: 750, gstRate: 12 },
        { itemName: 'Automation Panel Assembly', hsnCode: '8537', quantity: 1, unit: 'Nos', unitPrice: 18500, gstRate: 18 }
    ]
};

const getDocMeta = (type) => {
    if (type === 'invoice') return { title: 'TAX INVOICE', numberLabel: 'Invoice No' };
    if (type === 'challan') return { title: 'DELIVERY CHALLAN', numberLabel: 'Challan No' };
    return { title: 'QUOTATION', numberLabel: 'Quote No' };
};

const normalizeDocumentType = (type = 'quote') => {
    const value = String(type).trim().toLowerCase().replace(/\s+/g, '_');
    if (['invoice', 'tax_invoice', 'taxinvoice'].includes(value)) return 'invoice';
    if (['challan', 'delivery_challan', 'deliverychallan'].includes(value)) return 'challan';
    return 'quote';
};

const normalizeGstRate = (value, isChallan) => {
    if (isChallan && (value === undefined || value === null || value === '')) return 0;
    const parsed = Number(String(value ?? '').replace('%', ''));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 18;
};

const pickNumber = (...values) => {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return round2(parsed);
    }
    return 0;
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const round2 = (value) => Number((Number(value || 0)).toFixed(2));
const cleanValue = (value) => String(value ?? '').trim() || '-';
const formatQty = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pdfMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const safeFileName = (value) => String(value).replace(/[^a-z0-9_.-]/gi, '_');
const truncate = (value, maxLength) => String(value || '').length > maxLength ? `${String(value).slice(0, maxLength - 3)}...` : String(value || '');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const multiline = (value) => escapeHtml(cleanValue(value)).replace(/\n/g, '<br>');
const escapePdfText = (value) => String(value ?? '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const pdfText = (value, x, y, size = 10, bold = false, maxLength = 68) => {
    const font = bold ? '/F2' : '/F1';
    return ['BT', `${font} ${size} Tf`, `${x} ${y} Td`, `(${escapePdfText(truncate(value, maxLength))}) Tj`, 'ET'];
};

const writePdfPages = (pages) => {
    const safePages = pages.length ? pages : [''];
    const firstPageObjectId = 5;
    const pageObjectIds = safePages.map((_, index) => firstPageObjectId + (index * 2));
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${safePages.length} >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ];

    safePages.forEach((content, index) => {
        const pageObjectId = pageObjectIds[index];
        const contentObjectId = pageObjectId + 1;
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
        objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
    });

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

module.exports = { generatePDF, sampleDocumentData, normalizeDocumentData };
