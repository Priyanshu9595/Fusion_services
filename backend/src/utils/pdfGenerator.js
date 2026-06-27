const fs = require('fs');
const path = require('path');

const generatePDF = async (documentData, companySettings) => {
    const isChallan = documentData.type === 'challan';
    const docTitle = documentData.type === 'invoice' ? 'Tax Invoice' : documentData.type === 'quote' ? 'Quotation' : 'Delivery Challan';

    // Different columns based on document type
    const tableHeaders = isChallan 
        ? `<th>S.No</th><th>Item Description</th><th>HSN Code</th><th>Quantity</th>`
        : `<th>S.No</th><th>Item Description</th><th>HSN Code</th><th>Quantity</th><th>Unit Price</th><th>GST %</th><th>Total</th>`;

    const tableRows = documentData.items.map((item, index) => {
        if (isChallan) {
            return `<tr>
                <td>${index + 1}</td>
                <td>${item.item_name}</td>
                <td>${item.hsn || '-'}</td>
                <td>${item.qty} ${item.unit || ''}</td>
            </tr>`;
        }
        return `<tr>
            <td>${index + 1}</td>
            <td>${item.item_name}</td>
            <td>${item.hsn || '-'}</td>
            <td>${item.qty} ${item.unit || ''}</td>
            <td>₹${item.unit_price}</td>
            <td>${item.gst_percent}%</td>
            <td>₹${item.line_total}</td>
        </tr>`;
    }).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; padding: 40px; color: #111; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 32px; font-weight: 800; color: #1e3a8a; letter-spacing: 1px; }
            .company-details { font-size: 14px; color: #4b5563; margin-top: 5px; line-height: 1.5; }
            .doc-title { text-align: center; font-size: 24px; font-weight: 700; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 2px; color: #374151; background: #f3f4f6; padding: 10px; border-radius: 8px;}
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .box { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; }
            .box h3 { margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #111; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;}
            .box p { margin: 4px 0; color: #374151; }
            
            table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            table.items-table th, table.items-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
            table.items-table th { background-color: #f3f4f6; font-weight: 700; color: #111; text-transform: uppercase; font-size: 12px;}
            
            .totals-container { display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .totals { width: 350px; }
            .totals table { width: 100%; border-collapse: collapse; }
            .totals th, .totals td { padding: 10px 12px; text-align: right; border: 1px solid #e5e7eb; }
            .totals th { background-color: #f9fafb; text-align: left; font-weight: 600; color: #374151; }
            .totals .grand-total th, .totals .grand-total td { font-weight: 800; font-size: 16px; color: #111; background-color: #f3f4f6; }
            
            .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
            .footer-box { font-size: 13px; color: #374151; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb;}
            .footer-box strong { color: #111; display: block; margin-bottom: 5px; }
            
            .signatures { display: grid; grid-template-columns: 1fr 1fr; margin-top: 80px; text-align: center; }
            .signature-line { border-top: 1px solid #9ca3af; width: 200px; margin: 0 auto; padding-top: 10px; font-weight: 600; color: #374151; }
            
            .page-footer { margin-top: 50px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${companySettings.name || 'Fusion Services'}</div>
            <div class="company-details">
                ${companySettings.address ? companySettings.address.replace(/\n/g, '<br>') : 'Address Not Provided'}<br>
                <strong>GSTIN:</strong> ${companySettings.gstin || 'N/A'}
            </div>
        </div>

        <div class="doc-title">${docTitle}</div>

        <div class="info-grid">
            <div class="box">
                <h3>${isChallan ? 'Shipping To' : 'Billed To'}</h3>
                <p><strong>${documentData.customer_name}</strong></p>
                <p>${isChallan ? (documentData.shipping_address || documentData.billing_address || '') : (documentData.billing_address || '')}</p>
                ${!isChallan ? `<p><strong>GSTIN:</strong> ${documentData.customer_gstin || 'N/A'}</p>` : ''}
                ${documentData.phone ? `<p><strong>Phone:</strong> ${documentData.phone}</p>` : ''}
            </div>
            <div class="box">
                <h3>Document Details</h3>
                <p><strong>${isChallan ? 'Challan No' : documentData.type === 'quote' ? 'Quote No' : 'Invoice No'}:</strong> ${documentData.document_number}</p>
                <p><strong>Date:</strong> ${documentData.date}</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        ${!isChallan ? `
        <div class="totals-container">
            <div class="totals">
                <table>
                    <tr>
                        <th>Subtotal</th>
                        <td>₹${documentData.subtotal}</td>
                    </tr>
                    <tr>
                        <th>Total GST</th>
                        <td>₹${documentData.total_gst}</td>
                    </tr>
                    <tr class="grand-total">
                        <th>Grand Total</th>
                        <td>₹${documentData.grand_total}</td>
                    </tr>
                </table>
            </div>
        </div>
        ` : ''}

        <div class="footer-grid">
            ${(!isChallan && companySettings.bank_details) ? `
            <div class="footer-box">
                <strong>Bank Details:</strong>
                ${companySettings.bank_details.replace(/\n/g, '<br>')}
            </div>
            ` : '<div></div>'}
            
            ${companySettings.terms ? `
            <div class="footer-box">
                <strong>Terms & Conditions:</strong>
                ${companySettings.terms.replace(/\n/g, '<br>')}
            </div>
            ` : '<div></div>'}
        </div>
        
        <div class="signatures">
            ${isChallan ? `
            <div>
                <div class="signature-line">Receiver's Signature / Seal</div>
            </div>
            ` : '<div></div>'}
            
            <div>
                <div class="signature-line">Authorized Signatory</div>
                <div style="font-size: 11px; margin-top: 4px; color: #6b7280;">For ${companySettings.name}</div>
            </div>
        </div>

        <div class="page-footer">
            Generated securely by FusionDocs
        </div>
    </body>
    </html>
    `;

    const launchOptions = {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    let browser;
    try {
        const puppeteer = require('puppeteer');
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const dir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, `${documentData.document_number}.pdf`);
        await page.pdf({ path: filePath, format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
        return filePath;
    } catch (error) {
        console.error('Puppeteer PDF generation failed, using fallback PDF:', error.message);
        return generateFallbackPDF(documentData, companySettings);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

const generateFallbackPDF = async (documentData, companySettings) => {
    const dir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${documentData.document_number}.pdf`);
    const isChallan = documentData.type === 'challan';
    const docTitle = documentData.type === 'invoice' ? 'Tax Invoice' : documentData.type === 'quote' ? 'Quotation' : 'Delivery Challan';
    const lines = [
        companySettings.name || 'Fusion Services',
        docTitle,
        `Document No: ${documentData.document_number}`,
        `Date: ${documentData.date || '-'}`,
        '',
        `${isChallan ? 'Shipping To' : 'Billed To'}: ${documentData.customer_name || '-'}`,
        `Address: ${isChallan ? (documentData.shipping_address || documentData.billing_address || '-') : (documentData.billing_address || '-')}`,
        `Customer GSTIN: ${documentData.customer_gstin || 'N/A'}`,
        `Phone: ${documentData.phone || '-'}`,
        '',
        'Line Items',
        ...((documentData.items || []).map((item, index) => {
            const total = isChallan ? '' : ` | Price: Rs. ${item.unit_price} | GST: ${item.gst_percent}% | Total: Rs. ${item.line_total}`;
            return `${index + 1}. ${item.item_name} | HSN: ${item.hsn || '-'} | Qty: ${item.qty} ${item.unit || ''}${total}`;
        })),
        '',
        ...(isChallan ? [] : [
            `Subtotal: Rs. ${documentData.subtotal || 0}`,
            `Total GST: Rs. ${documentData.total_gst || 0}`,
            `Grand Total: Rs. ${documentData.grand_total || 0}`,
            '',
        ]),
        `Company GSTIN: ${companySettings.gstin || 'N/A'}`,
        `Bank Details: ${companySettings.bank_details || 'N/A'}`,
        `Terms: ${companySettings.terms || 'N/A'}`,
        '',
        'Generated securely by FusionDocs',
    ];

    fs.writeFileSync(filePath, createSimplePDF(lines));
    return filePath;
};

const createSimplePDF = (lines) => {
    const doc = buildStructuredData(lines);
    const content = [
        'q',
        '0.11 0.10 0.36 rg',
        '0 742 595 100 re f',
        '0.43 0.25 0.93 rg',
        '0 742 160 100 re f',
        '1 1 1 rg',
        ...text(doc.company, 44, 798, 24, true),
        ...text(doc.title, 44, 770, 13, false),
        'Q',

        '0.96 0.97 1 rg',
        '380 766 160 34 re f',
        '0.11 0.10 0.36 rg',
        ...text(doc.number, 395, 787, 12, true),
        ...text(doc.date, 395, 772, 9, false),

        '0.16 0.20 0.32 rg',
        ...text('BILLED TO', 44, 710, 9, true),
        ...text(doc.customer, 44, 690, 15, true),
        ...text(doc.address, 44, 671, 9, false),
        ...text(doc.gstin, 44, 656, 9, false),
        ...text(doc.phone, 44, 641, 9, false),

        '0.16 0.20 0.32 rg',
        ...text('DOCUMENT INFO', 372, 710, 9, true),
        ...text(doc.number, 372, 690, 12, true),
        ...text(doc.date, 372, 672, 10, false),
        ...text('Status: Saved', 372, 654, 10, false),

        '0.96 0.97 1 rg',
        '44 582 507 30 re f',
        '0.16 0.20 0.32 rg',
        ...text('ITEM', 58, 600, 9, true),
        ...text('QTY', 310, 600, 9, true),
        ...text('GST', 372, 600, 9, true),
        ...text('TOTAL', 470, 600, 9, true),
        ...buildTableRows(doc.items),

        '0.11 0.10 0.36 rg',
        '338 178 213 105 re f',
        '1 1 1 rg',
        ...text('Subtotal', 358, 254, 10, false),
        ...text(doc.subtotal, 470, 254, 10, true),
        ...text('Total GST', 358, 230, 10, false),
        ...text(doc.totalGst, 470, 230, 10, true),
        '1.00 0.65 0.34 rg',
        ...text('Grand Total', 358, 202, 13, true),
        ...text(doc.grandTotal, 462, 202, 15, true),

        '0.16 0.20 0.32 rg',
        ...text('Bank Details', 44, 254, 10, true),
        ...text(doc.bank, 44, 236, 9, false),
        ...text('Terms', 44, 208, 10, true),
        ...text(doc.terms, 44, 190, 9, false),

        '0.80 0.84 0.92 RG',
        '44 132 507 0.8 re S',
        '0.45 0.50 0.60 rg',
        ...text('Generated securely by FusionDocs', 44, 108, 9, false),
        ...text('Authorized Signatory', 418, 108, 9, true),
    ].join('\n');

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
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
};

const buildStructuredData = (lines) => {
    const get = (prefix) => (lines.find((line) => String(line).startsWith(prefix)) || '').replace(prefix, '').trim();
    const itemStart = lines.indexOf('Line Items') + 1;
    const itemEnd = lines.findIndex((line, index) => index > itemStart && String(line).startsWith('Subtotal:'));
    return {
        company: lines[0] || 'Fusion Services',
        title: lines[1] || 'Document',
        number: get('Document No:') || '-',
        date: get('Date:') || '-',
        customer: get('Billed To:') || get('Shipping To:') || '-',
        address: get('Address:') || '-',
        gstin: get('Customer GSTIN:') || 'N/A',
        phone: get('Phone:') || '-',
        items: lines.slice(itemStart, itemEnd > -1 ? itemEnd : itemStart + 5).filter(Boolean).slice(0, 8),
        subtotal: get('Subtotal:') || 'Rs. 0',
        totalGst: get('Total GST:') || 'Rs. 0',
        grandTotal: get('Grand Total:') || 'Rs. 0',
        bank: get('Bank Details:') || 'N/A',
        terms: get('Terms:') || 'N/A',
    };
};

const buildTableRows = (items) => {
    const commands = [];
    let y = 554;
    items.forEach((item, index) => {
        const parts = parseItemLine(item);
        if (index % 2 === 0) {
            commands.push('0.99 0.99 1 rg', `44 ${y - 13} 507 38 re f`);
        }
        commands.push(
            '0.16 0.20 0.32 rg',
            ...text(parts.name, 58, y, 9, true),
            ...text(parts.qty, 310, y, 9, false),
            ...text(parts.gst, 372, y, 9, false),
            ...text(parts.total, 470, y, 9, true)
        );
        y -= 42;
    });
    return commands;
};

const parseItemLine = (line) => {
    const clean = String(line || '');
    const name = clean.replace(/^\d+\.\s*/, '').split('| HSN:')[0].trim();
    return {
        name: truncate(name, 42),
        qty: extractBetween(clean, '| Qty:', '| Price:') || extractBetween(clean, '| Qty:', '|') || '-',
        gst: extractBetween(clean, '| GST:', '| Total:') || '-',
        total: extractAfter(clean, '| Total:') || '-',
    };
};

const text = (value, x, y, size = 10, bold = false) => {
    const font = bold ? '/F2' : '/F1';
    return [
        'BT',
        `${font} ${size} Tf`,
        `${x} ${y} Td`,
        `(${escapePdfText(truncate(String(value || ''), 68))}) Tj`,
        'ET',
    ];
};

const extractBetween = (value, start, end) => {
    const startIndex = value.indexOf(start);
    if (startIndex === -1) return '';
    const rest = value.slice(startIndex + start.length);
    const endIndex = rest.indexOf(end);
    return (endIndex === -1 ? rest : rest.slice(0, endIndex)).trim();
};

const extractAfter = (value, marker) => {
    const index = value.indexOf(marker);
    return index === -1 ? '' : value.slice(index + marker.length).trim();
};

const truncate = (value, maxLength) => value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const wrapLine = (line, maxLength) => {
    if (line.length <= maxLength) return [line];
    const words = line.split(' ');
    const rows = [];
    let current = '';
    words.forEach((word) => {
        if ((current + ' ' + word).trim().length > maxLength) {
            rows.push(current);
            current = word;
        } else {
            current = `${current} ${word}`.trim();
        }
    });
    if (current) rows.push(current);
    return rows;
};

const escapePdfText = (value) => value
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

module.exports = { generatePDF };
