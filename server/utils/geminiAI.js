const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * @desc    Google Gemini AI Integration for Review Analysis
 * @author  Module 3 Feature 8: AI-Powered Analytics & Reporting
 * @feature Sentiment analysis and insights generation from customer reviews
 */

/**
 * Analyze reviews using Google Gemini AI
 * @param {Array} reviews - Array of review objects with text and rating
 * @returns {Promise<Object>} - Analysis results with sentiment, insights, and recommendations
 */
async function analyzeReviewsWithGemini(reviews) {
  // Support both environment variable names
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file');
  }

  if (!reviews || reviews.length === 0) {
    console.log('⚠️  No reviews to analyze');
    throw new Error('No reviews available for analysis');
  }

  try {
    console.log(`🤖 Analyzing ${reviews.length} reviews with Gemini AI...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for stability and speed, or gemini-2.0-flash if available
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1, // Lower temperature for more deterministic JSON
      }
    });

    // Prepare reviews text for analysis
    const reviewsText = reviews.map((review, index) =>
      `Review ${index + 1} (Rating: ${review.rating}/5): ${review.comment || review.text || 'No comment'}`
    ).join('\n');

    // Create prompt for Gemini
    const prompt = `Analyze the following customer reviews for a maid service platform and provide detailed insights in JSON format.

Reviews Data:
${reviewsText}

Return a JSON object with this exact structure:
{
  "analytics": {
    "sentimentDistribution": {
      "positive": number,
      "neutral": number,
      "negative": number
    },
    "overallSentiment": "positive" | "neutral" | "negative",
    "keyInsights": ["string"],
    "topPraised": [{"feature": "string", "frequency": number, "examples": ["string"]}],
    "topComplaints": [{"issue": "string", "frequency": number, "severity": "high"|"medium"|"low", "examples": ["string"]}],
    "improvementSuggestions": [{"area": "string", "priority": "high"|"medium"|"low", "actionableSteps": ["string"], "expectedImpact": "string"}],
    "riskAreas": [{"risk": "string", "impact": "high"|"medium"|"low", "mitigation": "string"}]
  },
  "summary": "string",
  "averageRating": number
}

Guidelines:
- positive: 4-5 stars, neutral: 3 stars, negative: 1-2 stars.
- Ensure all numbers are actual numbers, not strings.
- Be specific and data-driven based ONLY on the provided reviews.`;

    console.log('📡 Calling Gemini API via SDK...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API response received');

    // Parse the JSON
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', text);
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }

    console.log('✅ Analysis completed successfully');
    return {
      ...analysis,
      usingAI: true,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Gemini AI analysis error:', error.message);
    throw new Error(`Gemini AI analysis failed: ${error.message}`);
  }
}

module.exports = {
  analyzeReviewsWithGemini
};