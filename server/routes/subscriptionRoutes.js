const express = require('express');
const router = express.Router();
const {
    createPlan,
    getPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    subscribeToPlan,
    getMySubscription,
    getSubscriptionHistory,
    cancelSubscription,
    checkSubscription,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Subscription Routes
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */

// ==========================================
// Public Routes
// ==========================================

// Get all active subscription plans
router.get('/plans', getPlans);

// Get single plan by ID
router.get('/plans/:id', getPlanById);

// ==========================================
// Admin Routes (Protected + Admin Only)
// ==========================================

// Create new subscription plan
router.post('/plans', protect, authorize('admin'), createPlan);

// Update subscription plan
router.put('/plans/:id', protect, authorize('admin'), updatePlan);

// Delete (deactivate) subscription plan
router.delete('/plans/:id', protect, authorize('admin'), deletePlan);

// ==========================================
// Customer Routes (Protected)
// ==========================================

// Subscribe to a plan
router.post('/subscribe/:planId', protect, authorize('customer'), subscribeToPlan);

// Get my active subscription
router.get('/my', protect, getMySubscription);

// Get subscription history
router.get('/history', protect, getSubscriptionHistory);

// Cancel subscription
router.post('/cancel', protect, cancelSubscription);

// Check if customer has valid subscription (for booking system)
router.get('/check', protect, checkSubscription);

module.exports = router;
