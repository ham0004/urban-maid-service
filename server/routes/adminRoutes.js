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
const {
    getDashboardMetrics,
    getPendingMaids,
    getAllMaids,
    getMaidById,
    approveMaid,
    rejectMaid,
} = require('../controllers/adminController');

/**
 * Admin Routes - All routes require admin role
 * @author Member-1 (Module 2 & Module 3)
 */

// Public route for customers to view categories
router.get('/service-categories', getAllCategories);

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard Metrics (Module 3 Feature 2)
router.get('/metrics', getDashboardMetrics);

// Maid Approval Routes (Module 3 Feature 2)
router.get('/maids', getAllMaids);
router.get('/maids/pending', getPendingMaids);
router.get('/maids/:id', getMaidById);
router.put('/maids/:id/approve', approveMaid);
router.put('/maids/:id/reject', rejectMaid);

// Service Category Routes (Module 2 Feature 1)
router.post('/categories', createCategory);
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;

