const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const pdfController = require('../controllers/pdfController');
const documentParser = require('../controllers/documentParser');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse', authenticateToken, upload.single('file'), documentParser.parseDocument);
router.post('/', authenticateToken, documentController.createDocument);
router.get('/', authenticateToken, documentController.getDocuments);
router.get('/public/pdf', pdfController.getPublicDocumentPDF); // unauthenticated
router.get('/:id', authenticateToken, documentController.getDocumentById);
router.get('/:id/pdf', authenticateToken, pdfController.downloadDocumentPDF);
router.get('/:id/share', authenticateToken, pdfController.generateShareLink);

module.exports = router;
