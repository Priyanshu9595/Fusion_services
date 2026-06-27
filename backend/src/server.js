require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FusionDocs backend is running.',
        health: '/api/health',
        frontend: process.env.FRONTEND_URL || 'https://fusion-services-1.onrender.com'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'FusionDocs API is running.' });
});

const mountRoutes = () => {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/settings', require('./routes/settings'));
    app.use('/api/customers', require('./routes/customers'));
    app.use('/api/dashboard', require('./routes/dashboard'));
    app.use('/api/documents', require('./routes/documents'));
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    mountRoutes();
    require('./database')
        .initializeDatabase()
        .catch((error) => {
            console.error('Database initialization failed after server start:', error);
        });
});
