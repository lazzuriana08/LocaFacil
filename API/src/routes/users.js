const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Admin 
router.get('/', authMiddleware, adminMiddleware, userController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, userController.getById);
router.post('/:userId/make-admin', authMiddleware, adminMiddleware, userController.makeAdmin);
router.delete('/:userId/deactivate', authMiddleware, adminMiddleware, userController.deactivateUser);

// User
router.put('/profile', authMiddleware, userController.update);

module.exports = router;
