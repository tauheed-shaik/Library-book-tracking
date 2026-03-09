const express = require('express');
const bookController = require('../controllers/bookController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', bookController.getBookById);

// Staff/Admin only routes
router.post('/', authMiddleware, requireRole('staff', 'admin'), bookController.addBook);
router.put('/:id', authMiddleware, requireRole('staff', 'admin'), bookController.updateBook);
router.delete('/:id', authMiddleware, requireRole('staff', 'admin'), bookController.deleteBook);

// Category routes
router.post('/categories/add', authMiddleware, requireRole('staff', 'admin'), bookController.addCategory);

module.exports = router;
