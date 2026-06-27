const db = require('../database');

const getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM CompanySettings ORDER BY id DESC LIMIT 1');
        const row = result.rows[0];
        
        if (!row) {
            return res.json({});
        }
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const updateSettings = async (req, res) => {
    const { name, address, gstin, bank_details, terms, quote_prefix, invoice_prefix, challan_prefix } = req.body;
    
    try {
        const result = await db.query('SELECT id FROM CompanySettings ORDER BY id DESC LIMIT 1');
        const row = result.rows[0];
        
        if (row) {
            await db.query(`UPDATE CompanySettings SET 
                name = $1, address = $2, gstin = $3, bank_details = $4, terms = $5, 
                quote_prefix = $6, invoice_prefix = $7, challan_prefix = $8 
                WHERE id = $9`,
                [name, address, gstin, bank_details, terms, quote_prefix || 'QT', invoice_prefix || 'INV', challan_prefix || 'DC', row.id]
            );
            res.json({ message: 'Settings updated successfully' });
        } else {
            const insertRes = await db.query(`INSERT INTO CompanySettings 
                (name, address, gstin, bank_details, terms, quote_prefix, invoice_prefix, challan_prefix) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [name, address, gstin, bank_details, terms, quote_prefix || 'QT', invoice_prefix || 'INV', challan_prefix || 'DC']
            );
            res.status(201).json({ message: 'Settings saved successfully', id: insertRes.rows[0].id });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

module.exports = { getSettings, updateSettings };
