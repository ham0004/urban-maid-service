const Review = require('../models/Review');
const { analyzeReviewsWithGemini } = require('../utils/geminiAI');

/**
 * @desc    Generate AI-powered analytics report
 * @route   POST /api/analytics/generate-report
 * @access  Private (Admin only)
 * @author  Module 3 Feature 8
 */
const generateAnalyticsReport = async (req, res, next) => {
  try {
    console.log('🤖 Admin requested AI-powered analytics report');

    const reviews = await Review.find()
      .populate('customer', 'name')
      .populate('maid', 'name')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${reviews.length} reviews in database`);

    if (reviews.length === 0) {
      return res.status(200).json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        recentReviews: [],
        analytics: null
      });
    }

    const reviewsForAnalysis = reviews.map(review => ({
      rating: review.rating,
      comment: review.review,
      text: review.review,
      maidName: review.maid?.name,
      customerName: review.customer?.name,
      createdAt: review.createdAt
    }));

    console.log('🔄 Sending reviews to Gemini AI for analysis...');
    const analysis = await analyzeReviewsWithGemini(reviewsForAnalysis);
    console.log('✅ AI analysis completed successfully');

    res.status(200).json({
      ...analysis,
      reviewCount: reviews.length,
      generatedAt: analysis.generatedAt || new Date(),
      dateRange: {
        from: reviews.length > 0 ? reviews[reviews.length - 1].createdAt : null,
        to: reviews.length > 0 ? reviews[0].createdAt : null
      },
      usingAI: true,
      model: 'gemini-2.5-flash'
    });
  } catch (error) {
    console.error('❌ Error generating AI report:', error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to generate AI report: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI analysis failed'
    });
  }
};

/**
 * @desc    Get review statistics
 * @route   GET /api/analytics/stats
 * @access  Private (Admin only)
 */
const getReviewStats = async (req, res, next) => {
  try {
    console.log('📊 Fetching analytics statistics...');

    const reviews = await Review.find();
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = [
      { _id: 1, count: reviews.filter(r => r.rating === 1).length },
      { _id: 2, count: reviews.filter(r => r.rating === 2).length },
      { _id: 3, count: reviews.filter(r => r.rating === 3).length },
      { _id: 4, count: reviews.filter(r => r.rating === 4).length },
      { _id: 5, count: reviews.filter(r => r.rating === 5).length }
    ];

    const sentiment = {
      positive: reviews.filter(r => r.rating >= 4).length,
      neutral: reviews.filter(r => r.rating === 3).length,
      negative: reviews.filter(r => r.rating <= 2).length
    };

    const recentReviews = await Review.find()
      .populate('customer', 'name')
      .populate('maid', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('rating review createdAt');

    console.log('✅ Statistics calculated');

    res.status(200).json({
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution,
      sentiment,
      recentReviews: recentReviews.map(r => ({
        _id: r._id,
        rating: r.rating,
        comment: r.review,
        review: r.review, // Added to match frontend expectation
        customer: { name: r.customer?.name || 'Anonymous' },
        maid: { name: r.maid?.name || 'Unknown' },
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error getting analytics stats:', error);
    next(error);
  }
};

/**
 * @desc    Get reviews by date range
 * @route   GET /api/analytics/reviews
 * @access  Private (Admin only)
 */
const getReviewsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('📅 Fetching reviews by date range:', startDate, 'to', endDate);

    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('maid', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${reviews.length} reviews`);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews.map(r => ({
        id: r._id,
        rating: r.rating,
        comment: r.review,
        customer: r.customer?.name,
        maid: r.maid?.name,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error getting reviews by date range:', error);
    next(error);
  }
};

module.exports = {
  generateAnalyticsReport,
  getReviewStats,
  getReviewsByDateRange
};