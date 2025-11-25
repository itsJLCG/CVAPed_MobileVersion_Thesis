"""
Therapy Exercises API Server
Flask-based REST API for managing speech therapy exercises
Handles Fluency, Language (Receptive & Expressive), Articulation exercises
AND Stroke Rehabilitation Exercise Recommendations
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import traceback
from datetime import datetime

# Import CRUD blueprints (Speech Therapy)
from fluency_crud import fluency_bp, init_fluency_crud
from language_crud import language_bp, init_language_crud
from receptive_crud import receptive_bp, init_receptive_crud
from articulation_crud import articulation_bp, init_articulation_crud

# Import Stroke Exercise Recommendation (Physical Therapy)
from exercise_recommender import ExerciseRecommender
from stroke_exercise_library import StrokeExerciseLibrary

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'CVACare')

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB: {DB_NAME}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    db = None

# Initialize CRUD modules with database
if db is not None:
    init_fluency_crud(db)
    init_language_crud(db)
    init_receptive_crud(db)
    init_articulation_crud(db)

# Initialize Stroke Exercise Recommendation system
exercise_library = StrokeExerciseLibrary()
exercise_recommender = ExerciseRecommender()
print("✅ Stroke Exercise Recommender initialized")

# Register blueprints (Speech Therapy)
app.register_blueprint(fluency_bp)
app.register_blueprint(language_bp)
app.register_blueprint(receptive_bp)
app.register_blueprint(articulation_bp)

@app.route('/api/therapy/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Therapy Exercises API',
        'database': 'connected' if db is not None else 'disconnected'
    }), 200

@app.route('/api/therapy/info', methods=['GET'])
def info():
    """API information endpoint"""
    return jsonify({
        'service': 'CVACare Therapy Exercises API',
        'version': '1.0.0',
        'endpoints': {
            'fluency': '/api/fluency-exercises',
            'language_expressive': '/api/language-exercises',
            'language_receptive': '/api/receptive-exercises',
            'articulation': '/api/articulation-exercises',
            'stroke_exercises': '/api/exercises/*'
        },
        'features': [
            'Fluency therapy exercise management',
            'Language therapy (expressive & receptive)',
            'Articulation therapy by sound',
            'Stroke rehabilitation exercise recommendations',
            'CRUD operations with role-based access',
            'Exercise seeding functionality',
            'Active/inactive toggle for exercises'
        ]
    }), 200

# ============================================================
# STROKE EXERCISE RECOMMENDATION ENDPOINTS (Physical Therapy)
# ============================================================

@app.route('/api/exercises/health', methods=['GET'])
def exercise_health():
    """Health check for exercise recommendation service"""
    return jsonify({
        'status': 'healthy',
        'service': 'Stroke Exercise Recommendation',
        'exercise_library_loaded': exercise_library is not None,
        'recommender_ready': exercise_recommender is not None
    }), 200

@app.route('/api/exercises/recommend', methods=['POST'])
def recommend_exercises():
    """
    Generate exercise recommendations based on detected gait problems
    
    Expected JSON body:
    {
        "detected_problems": [
            {
                "problem": "slow_cadence",
                "severity": "severe",
                "current_value": 85.5,
                "percentile": 15.2,
                "normal_range": "100-120 steps/min",
                "recommendation": "..."
            }
        ],
        "user_profile": {
            "age": 65,
            "fitness_level": "beginner",
            "equipment_available": ["chair"],
            "time_available_per_day": 30,
            "stroke_side": "left",
            "months_post_stroke": 6
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        detected_problems = data.get('detected_problems', [])
        user_profile = data.get('user_profile', {})
        
        if not detected_problems:
            return jsonify({
                'success': False,
                'error': 'No problems detected',
                'message': 'Detected problems array is empty'
            }), 400
        
        print(f"\n{'='*60}")
        print("🎯 Exercise Recommendation Request")
        print(f"{'='*60}")
        print(f"Problems detected: {len(detected_problems)}")
        for problem in detected_problems:
            print(f"  - {problem.get('problem')}: {problem.get('severity')}")
        print(f"User profile: Age {user_profile.get('age', 'N/A')}, "
              f"Fitness: {user_profile.get('fitness_level', 'N/A')}")
        print(f"{'='*60}\n")
        
        # Generate recommendations
        recommendations = exercise_recommender.recommend_exercises(
            detected_problems=detected_problems,
            user_profile=user_profile
        )
        
        print(f"✅ Recommendations generated:")
        print(f"   Total exercises: {recommendations['total_exercises']}")
        print(f"   Estimated timeline: {recommendations['estimated_timeline']['estimated_weeks']} weeks")
        print(f"   Daily time: {recommendations['daily_time_commitment']['average_minutes_per_day']} minutes\n")
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        print(f"❌ Error generating recommendations: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Failed to generate recommendations',
            'details': str(e)
        }), 500

@app.route('/api/exercises/library/problems', methods=['GET'])
def get_problem_types():
    """Get all available problem types and their exercises"""
    try:
        problem_types = exercise_library.get_all_problem_types()
        return jsonify({
            'success': True,
            'problem_types': problem_types
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exercises/library/<problem_type>/<severity>', methods=['GET'])
def get_exercises_for_problem(problem_type, severity):
    """Get exercises for a specific problem type and severity"""
    try:
        exercises = exercise_library.get_exercises_for_problem(problem_type, severity)
        return jsonify({
            'success': True,
            'problem_type': problem_type,
            'severity': severity,
            'exercises': exercises
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exercises/library/exercise/<exercise_id>', methods=['GET'])
def get_exercise_by_id(exercise_id):
    """Get a specific exercise by ID"""
    try:
        exercise = exercise_library.get_exercise_by_id(exercise_id)
        if exercise:
            return jsonify({
                'success': True,
                'exercise': exercise
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Exercise not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('THERAPY_PORT', 5002))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print("=" * 60)
    print("🎯 Therapy Exercises API Server")
    print("=" * 60)
    print("📍 Running on: http://localhost:" + str(port))
    print("🔧 Debug mode: " + str(debug))
    print("💾 Database: " + DB_NAME)
    print("=" * 60)
    print("📦 Services Available:")
    print("   ├─ Speech Therapy (Fluency, Language, Articulation)")
    print("   └─ Stroke Exercise Recommendations (Physical Therapy)")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
