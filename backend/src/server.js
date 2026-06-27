require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes will be imported here
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'FusionDocs API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    require('./database')
        .initializeDatabase()
        .catch((error) => {
            console.error('Database initialization failed after server start:', error);
        });
});
