const ArticulationProgress = require('../models/ArticulationProgress');
const FluencyProgress = require('../models/FluencyProgress');
const LanguageProgress = require('../models/LanguageProgress');
const GaitProgress = require('../models/GaitProgress');

/**
 * Get all therapy progress logs for a user
 * Aggregates progress from all therapy types into a chronological timeline
 */
exports.getUserHealthLogs = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const logs = [];

    // Fetch Articulation Progress
    const articulationProgress = await ArticulationProgress.find({ user_id: userId });
    
    articulationProgress.forEach(progress => {
      const soundId = progress.sound_id;
      const levels = progress.levels || {};
      
      Object.keys(levels).forEach(levelKey => {
        const level = levels[levelKey];
        const items = level.items || [];
        
        // Handle items as both array and object
        const itemsArray = Array.isArray(items) ? items : Object.values(items);
        
        itemsArray.forEach(item => {
          const trials = item.trials || [];
          
          trials.forEach(trial => {
            logs.push({
              id: `articulation_${progress._id}_${levelKey}_${item.item_index}_${trial.trial_number}`,
              type: 'articulation',
              therapyName: 'Articulation Therapy',
              soundId: soundId.toUpperCase(),
              level: parseInt(levelKey),
              target: item.target || 'N/A',
              trialNumber: trial.trial_number,
              score: trial.computed_score,
              details: {
                pronunciation: trial.pronunciation_score,
                accuracy: trial.accuracy_score,
                completeness: trial.completeness_score,
                fluency: trial.fluency_score,
                transcription: trial.transcription
              },
              timestamp: trial.recorded_at || progress.updated_at,
              createdAt: progress.created_at
            });
          });
        });
      });
    });

    // Fetch Fluency Progress
    const fluencyProgress = await FluencyProgress.find({ user_id: userId });
    
    fluencyProgress.forEach(progress => {
      const levels = progress.levels || {};
      
      Object.keys(levels).forEach(levelKey => {
        const level = levels[levelKey];
        const items = level.items || [];
        
        // Handle items as both array and object
        const itemsArray = Array.isArray(items) ? items : Object.values(items);
        
        itemsArray.forEach(item => {
          const attempts = item.attempts || [];
          
          attempts.forEach((attempt, attemptIndex) => {
            logs.push({
              id: `fluency_${progress._id}_${levelKey}_${item.item_index}_${attemptIndex}`,
              type: 'fluency',
              therapyName: 'Fluency Therapy',
              level: parseInt(levelKey),
              exerciseName: item.exercise_name || 'Fluency Exercise',
              attemptNumber: attemptIndex + 1,
              score: attempt.score || 0,
              completed: attempt.completed || false,
              details: {
                response: attempt.response,
                feedback: attempt.feedback
              },
              timestamp: attempt.completed_at || progress.updated_at,
              createdAt: progress.created_at
            });
          });
        });
      });
    });

    // Fetch Receptive Language Progress
    const receptiveProgress = await LanguageProgress.find({ 
      user_id: userId, 
      mode: 'receptive' 
    });
    
    receptiveProgress.forEach(progress => {
      const exercises = progress.exercises || {};
      
      Object.keys(exercises).forEach(exerciseId => {
        const exercise = exercises[exerciseId];
        
        logs.push({
          id: `receptive_${progress._id}_${exerciseId}`,
          type: 'receptive',
          therapyName: 'Receptive Language',
          exerciseId: exerciseId,
          correct: exercise.correct || false,
          attempts: exercise.attempts || 0,
          score: exercise.correct ? 100 : 0,
          details: {
            userAnswer: exercise.user_answer,
            correctAnswer: exercise.correct_answer
          },
          timestamp: exercise.completed_at || progress.updated_at,
          createdAt: progress.created_at
        });
      });
    });

    // Fetch Expressive Language Progress
    const expressiveProgress = await LanguageProgress.find({ 
      user_id: userId, 
      mode: 'expressive' 
    });
    
    expressiveProgress.forEach(progress => {
      const exercises = progress.exercises || {};
      
      Object.keys(exercises).forEach(exerciseId => {
        const exercise = exercises[exerciseId];
        
        logs.push({
          id: `expressive_${progress._id}_${exerciseId}`,
          type: 'expressive',
          therapyName: 'Expressive Language',
          exerciseId: exerciseId,
          correct: exercise.correct || false,
          attempts: exercise.attempts || 0,
          score: exercise.correct ? 100 : 0,
          details: {
            userAnswer: exercise.user_answer,
            correctAnswer: exercise.correct_answer
          },
          timestamp: exercise.completed_at || progress.updated_at,
          createdAt: progress.created_at
        });
      });
    });

    // Fetch Gait/Physical Therapy Progress
    const gaitProgress = await GaitProgress.find({ user_id: userId });
    
    gaitProgress.forEach(progress => {
      // Calculate overall score from multiple metrics (0-100 scale)
      const metrics = progress.metrics || {};
      const gaitScore = (
        (metrics.gait_symmetry || 0) * 30 +
        (metrics.stability_score || 0) * 30 +
        (metrics.step_regularity || 0) * 20 +
        (metrics.data_quality === 'excellent' ? 20 : 
         metrics.data_quality === 'good' ? 15 :
         metrics.data_quality === 'fair' ? 10 : 5)
      );
      
      logs.push({
        id: `gait_${progress._id}`,
        type: 'gait',
        therapyName: 'Physical Therapy - Gait Analysis',
        sessionId: progress.session_id,
        score: Math.round(gaitScore),
        metrics: {
          stepCount: metrics.step_count || 0,
          cadence: metrics.cadence || 0,
          strideLength: metrics.stride_length || 0,
          velocity: metrics.velocity || 0,
          gaitSymmetry: metrics.gait_symmetry || 0,
          stabilityScore: metrics.stability_score || 0,
          stepRegularity: metrics.step_regularity || 0,
          verticalOscillation: metrics.vertical_oscillation || 0
        },
        analysisDuration: progress.analysis_duration || 0,
        dataQuality: progress.data_quality || 'fair',
        gaitPhases: progress.gait_phases || [],
        timestamp: progress.created_at,
        createdAt: progress.created_at
      });
    });

    // Sort logs chronologically (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate summary statistics
    const summary = {
      totalSessions: logs.length,
      articulationSessions: logs.filter(l => l.type === 'articulation').length,
      fluencySessions: logs.filter(l => l.type === 'fluency').length,
      receptiveSessions: logs.filter(l => l.type === 'receptive').length,
      expressiveSessions: logs.filter(l => l.type === 'expressive').length,
      gaitSessions: logs.filter(l => l.type === 'gait').length,
      averageScore: logs.length > 0 
        ? (logs.reduce((sum, log) => sum + (log.score || 0), 0) / logs.length).toFixed(2)
        : 0,
      lastActivity: logs.length > 0 ? logs[0].timestamp : null
    };

    res.status(200).json({
      success: true,
      data: {
        logs,
        summary,
        total: logs.length
      }
    });
  } catch (error) {
    console.error('Error fetching health logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health logs',
      error: error.message
    });
  }
};

/**
 * Get health summary statistics for a user
 */
exports.getUserHealthSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all progress documents
    const [articulationDocs, fluencyDocs, receptiveDocs, expressiveDocs] = await Promise.all([
      ArticulationProgress.find({ user_id: userId }),
      FluencyProgress.find({ user_id: userId }),
      LanguageProgress.find({ user_id: userId, mode: 'receptive' }),
      LanguageProgress.find({ user_id: userId, mode: 'expressive' })
    ]);

    // Calculate summary
    const summary = {
      articulation: {
        total: articulationDocs.length,
        sounds: articulationDocs.map(doc => doc.sound_id),
        lastUpdated: articulationDocs.length > 0 
          ? articulationDocs.reduce((latest, doc) => 
              doc.updated_at > latest ? doc.updated_at : latest, 
              articulationDocs[0].updated_at)
          : null
      },
      fluency: {
        total: fluencyDocs.length,
        lastUpdated: fluencyDocs.length > 0 
          ? fluencyDocs[0].updated_at 
          : null
      },
      receptive: {
        total: receptiveDocs.length,
        totalExercises: receptiveDocs.reduce((sum, doc) => sum + (doc.total_exercises || 0), 0),
        completedExercises: receptiveDocs.reduce((sum, doc) => sum + (doc.completed_exercises || 0), 0),
        accuracy: receptiveDocs.length > 0 
          ? (receptiveDocs.reduce((sum, doc) => sum + (doc.accuracy || 0), 0) / receptiveDocs.length).toFixed(2)
          : 0,
        lastUpdated: receptiveDocs.length > 0 
          ? receptiveDocs[0].updated_at 
          : null
      },
      expressive: {
        total: expressiveDocs.length,
        totalExercises: expressiveDocs.reduce((sum, doc) => sum + (doc.total_exercises || 0), 0),
        completedExercises: expressiveDocs.reduce((sum, doc) => sum + (doc.completed_exercises || 0), 0),
        accuracy: expressiveDocs.length > 0 
          ? (expressiveDocs.reduce((sum, doc) => sum + (doc.accuracy || 0), 0) / expressiveDocs.length).toFixed(2)
          : 0,
        lastUpdated: expressiveDocs.length > 0 
          ? expressiveDocs[0].updated_at 
          : null
      }
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health summary',
      error: error.message
    });
  }
};
