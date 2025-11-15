/**
 * Fluency Therapy Routes
 * Handles fluency assessment and progress tracking
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const FluencyProgress = require('../models/FluencyProgress');
const FluencyTrial = require('../models/FluencyTrial');

/**
 * GET /api/fluency/exercises
 * Get all fluency exercises for patient
 */
router.get('/exercises', protect, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const exercises = await db.collection('fluency_exercises')
      .find({ is_active: true })
      .sort({ level: 1, order: 1 })
      .toArray();

    console.log(`📚 Found ${exercises.length} active fluency exercises`);

    // Group by level
    const levels = {};
    exercises.forEach(ex => {
      if (!levels[ex.level]) {
        levels[ex.level] = {
          level: ex.level,
          name: ex.level_name,
          color: ex.level_color,
          exercises: []
        };
      }
      levels[ex.level].exercises.push(ex);
    });

    res.json({
      success: true,
      levels: levels,
      total_exercises: exercises.length
    });
  } catch (error) {
    console.error('❌ Error fetching fluency exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises'
    });
  }
});

/**
 * GET /api/fluency/progress
 * Get user's fluency progress
 */
router.get('/progress', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    console.log(`📈 Loading fluency progress for user: ${userId}`);
    
    const progress = await FluencyProgress.findOne({ user_id: userId });

    if (!progress) {
      console.log('   No progress found - returning defaults');
      return res.json({
        success: true,
        has_progress: false,
        current_level: 1,
        current_exercise: 0,
        levels: {}
      });
    }

    // Find current level and exercise
    let currentLevel = 1;
    let currentExercise = 0;

    for (let level = 1; level <= 5; level++) {
      const levelKey = level.toString();
      const levelData = progress.levels[levelKey];
      
      if (!levelData || !levelData.exercises) {
        currentLevel = level;
        currentExercise = 0;
        break;
      }

      // Find incomplete exercise
      const exercises = levelData.exercises;
      let levelComplete = true;
      
      for (let exIdx = 0; exIdx < 10; exIdx++) {
        const exKey = exIdx.toString();
        if (!exercises[exKey]) {
          currentLevel = level;
          currentExercise = exIdx;
          levelComplete = false;
          break;
        }
      }

      if (!levelComplete) break;
    }

    console.log(`   Current position: Level ${currentLevel}, Exercise ${currentExercise}`);

    res.json({
      success: true,
      has_progress: true,
      current_level: currentLevel,
      current_exercise: currentExercise,
      levels: progress.levels || {}
    });
  } catch (error) {
    console.error('❌ Error fetching fluency progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
});

/**
 * POST /api/fluency/progress
 * Save fluency progress
 */
router.post('/progress', protect, async (req, res) => {
  try {
    const {
      level,
      exercise_index,
      exercise_id,
      speaking_rate,
      fluency_score,
      pause_count,
      disfluencies,
      passed
    } = req.body;

    const userId = req.user._id.toString();

    console.log(`💾 Saving fluency progress for user ${userId}`);
    console.log(`   Level: ${level}, Exercise: ${exercise_index}`);
    console.log(`   Fluency Score: ${fluency_score}, Passed: ${passed}`);

    // Find or create progress document
    let progress = await FluencyProgress.findOne({ user_id: userId });

    if (!progress) {
      console.log('   Creating new progress document');
      progress = new FluencyProgress({
        user_id: userId,
        levels: {},
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Initialize levels object
    if (!progress.levels) {
      progress.levels = {};
    }

    // Update level progress
    const levelKey = level.toString();
    if (!progress.levels[levelKey]) {
      progress.levels[levelKey] = {
        exercises: {}
      };
    }

    // Update exercise progress
    const exerciseKey = exercise_index.toString();
    progress.levels[levelKey].exercises[exerciseKey] = {
      exercise_id: exercise_id,
      completed: true,
      speaking_rate: speaking_rate,
      fluency_score: fluency_score,
      pause_count: pause_count,
      disfluencies: disfluencies,
      passed: passed,
      last_attempt: new Date()
    };

    progress.updated_at = new Date();
    progress.markModified('levels');

    await progress.save();

    // Save trial data to fluency_trials collection
    const trialData = {
      user_id: userId,
      level: level,
      exercise_index: exercise_index,
      exercise_id: exercise_id,
      speaking_rate: speaking_rate,
      fluency_score: fluency_score,
      pause_count: pause_count,
      disfluencies: disfluencies,
      passed: passed,
      timestamp: new Date()
    };

    await FluencyTrial.create(trialData);

    console.log('   ✅ Progress saved to both collections');

    res.json({
      success: true,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving fluency progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message
    });
  }
});

/**
 * GET /api/fluency-progress/all
 * Get all users' fluency progress (Admin endpoint)
 */
router.get('/all', protect, async (req, res) => {
  try {
    const FluencyProgress = require('../models/FluencyProgress');
    const User = require('../models/User');

    const progressData = await FluencyProgress.find({}).lean();

    const enrichedData = await Promise.all(progressData.map(async (progress) => {
      const user = await User.findById(progress.user_id).select('name email');
      return {
        _id: progress._id,
        user_id: progress.user_id,
        user_name: user?.name || 'Unknown',
        email: user?.email || '',
        current_exercise: progress.current_exercise || 0,
        current_level: progress.current_level || 1,
        total_trials: progress.completed_exercises || 0,
        last_score: progress.fluency_score || 0,
        last_activity: progress.updated_at || progress.created_at
      };
    }));

    res.json(enrichedData);
  } catch (error) {
    console.error('Error fetching all fluency progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress data'
    });
  }
});

module.exports = router;
