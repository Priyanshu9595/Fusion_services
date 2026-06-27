const puppeteer = require('puppeteer');
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

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const dir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = path.join(dir, `${documentData.document_number}.pdf`);
    await page.pdf({ path: filePath, format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
    
    await browser.close();
    
    return filePath;
};

module.exports = { generatePDF };
