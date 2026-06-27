const db = require('../database');

const getDashboardStats = async (req, res) => {
    const stats = {
        totalQuotes: 0,
        totalInvoices: 0,
        totalChallans: 0,
        recentDocuments: []
    };

    try {
        let countQuery = `SELECT type, COUNT(*) as count FROM Documents`;
        let countParams = [];
        if (req.user.role !== 'admin') {
            countQuery += ` WHERE created_by = $1`;
            countParams.push(req.user.id);
        }
        countQuery += ` GROUP BY type`;

        const countResult = await db.query(countQuery, countParams);
        countResult.rows.forEach(row => {
            if (row.type === 'quote') stats.totalQuotes = parseInt(row.count);
            if (row.type === 'invoice') stats.totalInvoices = parseInt(row.count);
            if (row.type === 'challan') stats.totalChallans = parseInt(row.count);
        });

        let docQuery = `
            SELECT d.*, c.name as customer_name 
            FROM Documents d
            LEFT JOIN Customers c ON d.customer_id = c.id
        `;
        let docParams = [];
        if (req.user.role !== 'admin') {
            docQuery += ` WHERE d.created_by = $1`;
            docParams.push(req.user.id);
        }
        docQuery += ` ORDER BY d.id DESC LIMIT 5`;

        const recentDocs = await db.query(docQuery, docParams);
        stats.recentDocuments = recentDocs.rows;
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getDashboardStats };
