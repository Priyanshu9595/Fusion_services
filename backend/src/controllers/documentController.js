const db = require('../database');
const { calculateDocumentTotals } = require('../utils/calculations');

// Generate Next Document Number
const generateDocumentNumber = async (type, prefix) => {
    const result = await db.query('SELECT document_number FROM Documents WHERE type = $1 ORDER BY id DESC LIMIT 1', [type]);
    const row = result.rows[0];
    if (!row) {
        return `${prefix}-001`;
    } else {
        const parts = row.document_number.split('-');
        const num = parseInt(parts[1], 10);
        const nextNum = (num + 1).toString().padStart(3, '0');
        return `${prefix}-${nextNum}`;
    }
};

const createDocument = async (req, res) => {
    const { type, customer_id, date, items, discount = 0 } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Bill of Materials cannot be empty.' });
    }

    const client = await db.pool.connect();
    
    try {
        // 1. Get Prefix based on Document Type
        const settingsRes = await client.query('SELECT quote_prefix, invoice_prefix, challan_prefix FROM CompanySettings ORDER BY id DESC LIMIT 1');
        const settings = settingsRes.rows[0];
        let prefix = 'QT';
        if (type === 'invoice') prefix = settings?.invoice_prefix || 'INV';
        else if (type === 'challan') prefix = settings?.challan_prefix || 'DC';
        else prefix = settings?.quote_prefix || 'QT';

        const document_number = await generateDocumentNumber(type, prefix);

        // 2. Perform server-side exact calculations
        const totals = calculateDocumentTotals(items, discount);

        // 3. Save Document and Items in transaction
        await client.query('BEGIN');

        const docRes = await client.query(`INSERT INTO Documents (document_number, type, date, customer_id, subtotal, total_gst, grand_total, status, created_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'saved', $8) RETURNING id`,
            [document_number, type, date, customer_id, totals.subtotal, totals.totalGst, totals.grandTotal, req.user.id]
        );
        
        const documentId = docRes.rows[0].id;
        
        for (const item of totals.items) {
            await client.query(`INSERT INTO DocumentItems 
                (document_id, item_name, hsn, qty, unit, unit_price, gst_percent, line_total) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [documentId, item.item_name, item.hsn, item.qty, item.unit, item.unit_price, item.gst_percent, item.line_total]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Document created successfully', document_number, document_id: documentId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getDocuments = async (req, res) => {
    const { search, type } = req.query;
    let query = `
        SELECT d.*, c.name as customer_name 
        FROM Documents d 
        LEFT JOIN Customers c ON d.customer_id = c.id 
        WHERE 1=1
    `;
    let params = [];
    let paramIndex = 1;

    if (type) {
        query += ` AND d.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
    }
    if (search) {
        query += ` AND (c.name ILIKE $${paramIndex} OR d.document_number ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }
    if (req.user.role !== 'admin') {
        query += ` AND d.created_by = $${paramIndex}`;
        params.push(req.user.id);
        paramIndex++;
    }
    
    query += ' ORDER BY d.id DESC';

    try {
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const getDocumentById = async (req, res) => {
    const docId = req.params.id;
    
    try {
        const docResult = await db.query(`SELECT d.*, c.name as customer_name, c.billing_address, c.shipping_address, c.gstin as customer_gstin, c.phone, c.email
            FROM Documents d 
            LEFT JOIN Customers c ON d.customer_id = c.id 
            WHERE d.id = $1`, [docId]);
            
        const document = docResult.rows[0];
        if (!document) return res.status(404).json({ error: 'Document not found' });

        if (req.user.role !== 'admin' && document.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied to this document' });
        }

        const itemsResult = await db.query('SELECT * FROM DocumentItems WHERE document_id = $1', [docId]);
        document.items = itemsResult.rows;
        
        res.json(document);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { createDocument, getDocuments, getDocumentById };
