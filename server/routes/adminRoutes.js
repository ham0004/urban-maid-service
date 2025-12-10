const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/serviceCategoryController');

/**
 * Admin Routes - All routes require admin role
 * @author Member-1 (Module 2)
 */

// Public route for customers to view categories
router.get('/service-categories', getAllCategories);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/categories', createCategory);
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
