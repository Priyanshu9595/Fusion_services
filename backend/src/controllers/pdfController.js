const db = require('../database');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const generateDocumentPDF = async (document, companySettings) => {
    const { generatePDF } = require('../utils/pdfGenerator');
    return generatePDF(document, companySettings);
};

const downloadDocumentPDF = async (req, res) => {
    const docId = req.params.id;
    
    try {
        // 1. Get Document details
        const docResult = await db.query(`SELECT d.*, c.name as customer_name, c.billing_address, c.shipping_address, c.gstin as customer_gstin, c.phone, c.email
                FROM Documents d 
                LEFT JOIN Customers c ON d.customer_id = c.id 
                WHERE d.id = $1`, [docId]);
        const document = docResult.rows[0];
        if (!document) return res.status(404).json({ error: 'Document not found' });

        // 2. Get Document Items
        const itemsResult = await db.query('SELECT * FROM DocumentItems WHERE document_id = $1', [docId]);
        document.items = itemsResult.rows;
        
        // 3. Get Company Settings
        const settingsResult = await db.query('SELECT * FROM CompanySettings ORDER BY id DESC LIMIT 1');
        const companySettings = settingsResult.rows[0] || {};

        // 4. Generate PDF
        const pdfPath = await generateDocumentPDF(document, companySettings);
        
        // 5. Send file and then delete it
        res.download(pdfPath, `${document.document_number}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading file', err);
            }
            // Delete temp file after download
            fs.unlink(pdfPath, (err) => {
                if (err) console.error('Error deleting temp pdf', err);
            });
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

const generateShareLink = async (req, res) => {
    const docId = req.params.id;
    try {
        // Verify document exists and user has access
        const docResult = await db.query('SELECT created_by FROM Documents WHERE id = $1', [docId]);
        if (docResult.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
        
        if (req.user.role !== 'admin' && docResult.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const token = jwt.sign({ docId }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });
        const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}/api`;
        const link = `${apiBaseUrl}/documents/public/pdf?token=${token}`;
        res.json({ link });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getPublicDocumentPDF = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(401).json({ error: 'Missing share token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const docId = decoded.docId;

        // Generate PDF
        const docResult = await db.query(`SELECT d.*, c.name as customer_name, c.billing_address, c.shipping_address, c.gstin as customer_gstin, c.phone, c.email
                FROM Documents d 
                LEFT JOIN Customers c ON d.customer_id = c.id 
                WHERE d.id = $1`, [docId]);
        const document = docResult.rows[0];
        if (!document) return res.status(404).json({ error: 'Document not found' });

        const itemsResult = await db.query('SELECT * FROM DocumentItems WHERE document_id = $1', [docId]);
        document.items = itemsResult.rows;
        
        const settingsResult = await db.query('SELECT * FROM CompanySettings ORDER BY id DESC LIMIT 1');
        const companySettings = settingsResult.rows[0] || {};

        const pdfPath = await generateDocumentPDF(document, companySettings);
        
        res.download(pdfPath, `${document.document_number}.pdf`, (err) => {
            if (err) console.error('Error downloading file', err);
            fs.unlink(pdfPath, (err) => {
                if (err) console.error('Error deleting temp pdf', err);
            });
        });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired share token' });
    }
};

module.exports = { downloadDocumentPDF, generateShareLink, getPublicDocumentPDF };
