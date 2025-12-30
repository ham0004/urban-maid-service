const express = require('express');
const router = express.Router();
const {
    addFavorite,
    removeFavorite,
    getFavorites,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Favorite Maids Routes
 * @description Routes for managing customer's favorite maids
 */

// All routes require authentication
router.use(protect);

// @route   GET /api/favorites
// @desc    Get all favorite maids
// @access  Private (Customer)
router.get('/', getFavorites);

// @route   POST /api/favorites/:maidId
// @desc    Add maid to favorites
// @access  Private (Customer)
router.post('/:maidId', addFavorite);

// @route   DELETE /api/favorites/:maidId
// @desc    Remove maid from favorites
// @access  Private (Customer)
router.delete('/:maidId', removeFavorite);

module.exports = router;
