const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const multer = require('multer');

// Memory storage for multer since we upload buffer directly to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', requireAuth, requireRole(['AGENT', 'ADMIN']), upload.single('photo'), orderController.createOrder);
router.get('/', requireAuth, orderController.getOrders); // Logic inside filters by role
router.put('/:id', requireAuth, orderController.updateOrder);
router.get('/export/:clientId', requireAuth, requireRole(['ADMIN']), orderController.exportClientOrders);

module.exports = router;
