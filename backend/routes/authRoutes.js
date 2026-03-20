const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.post('/register', requireAuth, requireRole(['ADMIN']), authController.register); // Only admin can create users
router.post('/login', authController.login);
router.get('/users', requireAuth, requireRole(['ADMIN', 'AGENT']), authController.getUsers);
router.post('/assign-agent', requireAuth, requireRole(['ADMIN']), authController.assignAgentToClient);

module.exports = router;
