const express = require('express');
const axios = require('axios');
const router = express.Router();
const GaitProgress = require('../models/GaitProgress');
const { protect } = require('../middleware/auth');

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
 * @access  Private
 */
router.post('/analyze', protect, async (req, res) => {
  try {
    const { 
      accelerometer, 
      gyroscope, 
      magnetometer, 
      barometer, 
      deviceMotion, 
      pedometer, 
      session_id 
    } = req.body;
    const user_id = req.user._id; // Get user ID from authenticated user

    // Validate required data
    if (!accelerometer && !gyroscope) {
      return res.status(400).json({
        success: false,
        message: 'At least one sensor type (accelerometer or gyroscope) is required'
      });
    }

    // Forward request to Python service with all sensor data
    const response = await axios.post(`${GAIT_SERVICE_URL}/api/gait/analyze`, {
      accelerometer,
      gyroscope,
      magnetometer: magnetometer || [],
      barometer: barometer || [],
      deviceMotion: deviceMotion || [],
      pedometer: pedometer || {},
      user_id: user_id.toString(),
      session_id
    }, {
      timeout: 30000 // 30 second timeout
    });

    // Save analysis results to MongoDB
    if (response.data.success) {
      try {
        const analysisData = response.data.data;
        
        // Detect problems using Python service
        let problemsData = null;
        try {
          const problemsResponse = await axios.post(`${GAIT_SERVICE_URL}/api/gait/detect-problems`, {
            metrics: analysisData.metrics
          }, {
            timeout: 5000
          });
          
          if (problemsResponse.data.success) {
            problemsData = problemsResponse.data;
            console.log(`  ✓ Problem detection: ${problemsData.problems_detected} issue(s) found`);
          }
        } catch (problemError) {
          console.error('  ⚠️  Problem detection failed:', problemError.message);
          // Continue without problem data
        }
        
        const gaitProgress = new GaitProgress({
          user_id: user_id,
          session_id: session_id || `session_${Date.now()}`,
          metrics: analysisData.metrics,
          gait_phases: analysisData.gait_phases,
          analysis_duration: analysisData.analysis_duration,
          data_quality: analysisData.data_quality,
          sensors_used: analysisData.sensors_used,
          detected_problems: problemsData ? problemsData.problems : [],
          problem_summary: problemsData ? problemsData.summary : null
        });

        await gaitProgress.save();
        console.log('✓ Gait analysis results saved to database for user:', user_id);
        console.log('  Step count:', analysisData.metrics.step_count);
        console.log('  Sensors used:', JSON.stringify(analysisData.sensors_used));
        if (problemsData) {
          console.log('  Problems detected:', problemsData.problems_detected);
          console.log('  Risk level:', problemsData.summary.risk_level);
        }
        
        // Add problem data to response
        if (problemsData) {
          response.data.data.detected_problems = problemsData.problems;
          response.data.data.problem_summary = problemsData.summary;
        }
      } catch (dbError) {
        console.error('❌ Error saving gait analysis to database:', dbError.message);
        // Continue even if DB save fails - return analysis results
      }
    }

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
 * @route   GET /api/gait/history
 * @desc    Get gait analysis history for authenticated user
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch from MongoDB
    const gaitHistory = await GaitProgress.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: gaitHistory,
      count: gaitHistory.length
    });
  } catch (error) {
    console.error('History fetch error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gait history',
      error: error.message
    });
  }
});

module.exports = router;
