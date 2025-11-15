const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get Gait Analysis Service URL from environment
// MUST be configured in .env file - no localhost fallback for production
if (!process.env.GAIT_ANALYSIS_URL) {
  console.warn('⚠️  WARNING: GAIT_ANALYSIS_URL not set in .env file!');
  console.warn('⚠️  Using localhost:5001 as fallback - this will NOT work on mobile devices!');
}
const GAIT_SERVICE_URL = process.env.GAIT_ANALYSIS_URL || 'http://localhost:5001';

console.log(`✓ Gait Analysis Service configured at: ${GAIT_SERVICE_URL}`);

/**
 * @route   GET /api/gait/health
 * @desc    Check gait analysis service health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${GAIT_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    console.error('Gait service health check failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'Gait analysis service is unavailable',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gait/analyze
 * @desc    Analyze gait data from accelerometer and gyroscope
 * @access  Private (add auth middleware if needed)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { accelerometer, gyroscope, user_id, session_id } = req.body;

    // Validate required data
    if (!accelerometer && !gyroscope) {
      return res.status(400).json({
        success: false,
        message: 'At least one sensor type (accelerometer or gyroscope) is required'
      });
    }

    // Forward request to Python service
    const response = await axios.post(`${GAIT_SERVICE_URL}/api/gait/analyze`, {
      accelerometer,
      gyroscope,
      user_id,
      session_id
    }, {
      timeout: 30000 // 30 second timeout
    });

    res.json(response.data);
  } catch (error) {
    console.error('Gait analysis error:', error.message);
    
    if (error.response) {
      // Python service returned an error
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to analyze gait data',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/gait/realtime
 * @desc    Real-time gait analysis for streaming data
 * @access  Private (add auth middleware if needed)
 */
router.post('/realtime', async (req, res) => {
  try {
    const { accelerometer, gyroscope } = req.body;

    // Forward request to Python service
    const response = await axios.post(`${GAIT_SERVICE_URL}/api/gait/realtime`, {
      accelerometer,
      gyroscope
    }, {
      timeout: 5000 // 5 second timeout for realtime
    });

    res.json(response.data);
  } catch (error) {
    console.error('Real-time analysis error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process real-time data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/gait/history/:userId
 * @desc    Get gait analysis history for a specific user
 * @access  Private (add auth middleware if needed)
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 10;

    // Forward request to Python service
    const response = await axios.get(
      `${GAIT_SERVICE_URL}/api/gait/history/${userId}?limit=${limit}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('History fetch error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gait history',
      error: error.message
    });
  }
});

module.exports = router;
