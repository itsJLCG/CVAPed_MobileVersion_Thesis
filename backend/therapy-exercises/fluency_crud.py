"""
Fluency Exercise CRUD Operations
Manages fluency therapy exercises (5 levels: Breathing, Phrases, Sentences, Reading, Spontaneous)
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from bson import ObjectId
import datetime
import jwt
import os

# Create Blueprint
fluency_bp = Blueprint('fluency_crud', __name__)

# Database collections (will be set by app.py)
db = None
users_collection = None
fluency_exercises_collection = None

def init_fluency_crud(database):
    """Initialize database collections"""
    global db, users_collection, fluency_exercises_collection
    db = database
    users_collection = db['users']
    fluency_exercises_collection = db['fluency_exercises']
    print("✅ Fluency CRUD initialized")

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, os.getenv('SECRET_KEY', 'your-secret-key-here'), algorithms=["HS256"])
            # Node.js backend uses 'id' field, not 'user_id'
            user_id = data.get('id') or data.get('user_id')
            if not user_id:
                return jsonify({'message': 'Invalid token format!'}), 401
            current_user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Therapist-only decorator
def therapist_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') not in ['therapist', 'admin']:
            return jsonify({'message': 'Unauthorized. Therapist access required.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


@fluency_bp.route('/api/fluency-exercises/seed', methods=['POST'])
@token_required
@therapist_required
def seed_default_exercises(current_user):
    """Seed database with default fluency exercises (5 levels)"""
    try:
        # Check if exercises already exist
        existing = fluency_exercises_collection.count_documents({})
        if existing > 0:
            return jsonify({
                'success': False,
                'message': f'Database already has {existing} exercises. Clear them first if you want to reseed.',
                'existing_count': existing
            }), 400
        
        # Default exercises for all 5 levels
        default_exercises = [
            # Level 1: Breathing & Single Words
            {
                'level': 1, 'level_name': 'Breathing & Single Words', 'level_color': '#e8b04e', 'order': 1,
                'exercise_id': 'breath-1', 'type': 'controlled-breathing',
                'instruction': 'Take a deep breath, hold for 2 seconds, then say this word slowly',
                'target': 'Hello', 'expected_duration': 3, 'breathing': True, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 1, 'level_name': 'Breathing & Single Words', 'level_color': '#e8b04e', 'order': 2,
                'exercise_id': 'breath-2', 'type': 'controlled-breathing',
                'instruction': 'Breathe in deeply, pause, then say this word',
                'target': 'Thank you', 'expected_duration': 3, 'breathing': True, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 1, 'level_name': 'Breathing & Single Words', 'level_color': '#e8b04e', 'order': 3,
                'exercise_id': 'breath-3', 'type': 'controlled-breathing',
                'instruction': 'Take a slow breath, then say this word smoothly',
                'target': 'Water', 'expected_duration': 3, 'breathing': True, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            # Level 2: Short Phrases
            {
                'level': 2, 'level_name': 'Short Phrases', 'level_color': '#479ac3', 'order': 1,
                'exercise_id': 'phrase-1', 'type': 'short-phrase',
                'instruction': 'Read this short phrase slowly and smoothly',
                'target': 'Good morning', 'expected_duration': 4, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 2, 'level_name': 'Short Phrases', 'level_color': '#479ac3', 'order': 2,
                'exercise_id': 'phrase-2', 'type': 'short-phrase',
                'instruction': 'Say this phrase at a comfortable pace',
                'target': 'How are you', 'expected_duration': 4, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 2, 'level_name': 'Short Phrases', 'level_color': '#479ac3', 'order': 3,
                'exercise_id': 'phrase-3', 'type': 'short-phrase',
                'instruction': 'Speak this phrase clearly and slowly',
                'target': 'Nice to meet you', 'expected_duration': 5, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            # Level 3: Complete Sentences
            {
                'level': 3, 'level_name': 'Complete Sentences', 'level_color': '#ce3630', 'order': 1,
                'exercise_id': 'sentence-1', 'type': 'complete-sentence',
                'instruction': 'Read this sentence at a slow, steady pace',
                'target': 'The cat is sleeping on the couch.', 'expected_duration': 6, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 3, 'level_name': 'Complete Sentences', 'level_color': '#ce3630', 'order': 2,
                'exercise_id': 'sentence-2', 'type': 'complete-sentence',
                'instruction': 'Say this sentence smoothly without rushing',
                'target': 'I like to play basketball with my friends.', 'expected_duration': 7, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            # Level 4: Reading Passages
            {
                'level': 4, 'level_name': 'Reading Passages', 'level_color': '#8e44ad', 'order': 1,
                'exercise_id': 'passage-1', 'type': 'reading-passage',
                'instruction': 'Read this short passage slowly and clearly',
                'target': 'The sun rises in the east. It brings light and warmth to the world. Birds sing in the morning.', 
                'expected_duration': 15, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 4, 'level_name': 'Reading Passages', 'level_color': '#8e44ad', 'order': 2,
                'exercise_id': 'passage-2', 'type': 'reading-passage',
                'instruction': 'Read at your own pace, focusing on smooth speech',
                'target': 'A small dog ran across the park. The children laughed and played. It was a beautiful day.', 
                'expected_duration': 15, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            # Level 5: Spontaneous Speech
            {
                'level': 5, 'level_name': 'Spontaneous Speech', 'level_color': '#27ae60', 'order': 1,
                'exercise_id': 'spontaneous-1', 'type': 'spontaneous-speech',
                'instruction': 'Talk about your favorite food for 30 seconds',
                'target': 'Describe your favorite food and why you like it', 'expected_duration': 30, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            },
            {
                'level': 5, 'level_name': 'Spontaneous Speech', 'level_color': '#27ae60', 'order': 2,
                'exercise_id': 'spontaneous-2', 'type': 'spontaneous-speech',
                'instruction': 'Tell a story about your day',
                'target': 'Describe what you did today', 'expected_duration': 30, 'breathing': False, 'is_active': True,
                'created_at': datetime.datetime.utcnow(), 'updated_at': datetime.datetime.utcnow()
            }
        ]
        
        # Insert all exercises
        result = fluency_exercises_collection.insert_many(default_exercises)
        
        return jsonify({
            'success': True,
            'message': f'Successfully seeded {len(result.inserted_ids)} fluency exercises',
            'count': len(result.inserted_ids)
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@fluency_bp.route('/api/fluency-exercises', methods=['GET'])
@token_required
def get_all_exercises(current_user):
    """Get all fluency exercises grouped by level"""
    try:
        exercises = list(fluency_exercises_collection.find().sort([('level', 1), ('order', 1)]))
        
        # Convert ObjectId to string
        for ex in exercises:
            ex['_id'] = str(ex['_id'])
            if 'created_at' in ex:
                ex['created_at'] = ex['created_at'].isoformat()
            if 'updated_at' in ex:
                ex['updated_at'] = ex['updated_at'].isoformat()
        
        return jsonify({
            'success': True,
            'exercises': exercises,
            'count': len(exercises)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@fluency_bp.route('/api/fluency-exercises', methods=['POST'])
@token_required
@therapist_required
def create_exercise(current_user):
    """Create a new fluency exercise"""
    try:
        data = request.get_json()
        
        # Required fields (user input only)
        required_fields = ['level', 'type', 'instruction', 'target', 'expected_duration', 'order']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        level = int(data['level'])
        exercise_type = data['type']
        order = int(data['order'])
        
        # Auto-generate level metadata based on level number
        level_metadata = {
            1: {'name': 'Breathing & Single Words', 'color': '#e8b04e'},
            2: {'name': 'Short Phrases', 'color': '#479ac3'},
            3: {'name': 'Complete Sentences', 'color': '#ce3630'},
            4: {'name': 'Reading Passages', 'color': '#8e44ad'},
            5: {'name': 'Spontaneous Speech', 'color': '#27ae60'}
        }
        
        # Auto-generate exercise_id based on type and order
        # Format: {type-prefix}-{order}
        type_prefixes = {
            'controlled-breathing': 'breath',
            'short-phrase': 'phrase',
            'sentence': 'sentence',
            'passage': 'passage',
            'spontaneous': 'spontaneous'
        }
        
        exercise_id = f"{type_prefixes.get(exercise_type, 'exercise')}-{order}"
        
        # Create exercise document with auto-generated fields
        exercise = {
            'level': level,
            'level_name': level_metadata.get(level, {}).get('name', 'Unknown Level'),
            'level_color': level_metadata.get(level, {}).get('color', '#999999'),
            'order': order,
            'exercise_id': exercise_id,
            'type': exercise_type,
            'instruction': data['instruction'],
            'target': data['target'],
            'expected_duration': int(data['expected_duration']),
            'breathing': data.get('breathing', False),
            'is_active': data.get('is_active', True),
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        result = fluency_exercises_collection.insert_one(exercise)
        exercise['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'message': 'Exercise created successfully',
            'exercise': exercise
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@fluency_bp.route('/api/fluency-exercises/<exercise_id>', methods=['PUT'])
@token_required
@therapist_required
def update_exercise(current_user, exercise_id):
    """Update an existing fluency exercise"""
    try:
        data = request.get_json()
        
        # Remove _id if present
        if '_id' in data:
            del data['_id']
        
        # Add updated timestamp
        data['updated_at'] = datetime.datetime.utcnow()
        
        result = fluency_exercises_collection.update_one(
            {'_id': ObjectId(exercise_id)},
            {'$set': data}
        )
        
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Exercise not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Exercise updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@fluency_bp.route('/api/fluency-exercises/<exercise_id>', methods=['DELETE'])
@token_required
@therapist_required
def delete_exercise(current_user, exercise_id):
    """Delete a fluency exercise"""
    try:
        result = fluency_exercises_collection.delete_one({'_id': ObjectId(exercise_id)})
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Exercise not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Exercise deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@fluency_bp.route('/api/fluency-exercises/<exercise_id>/toggle-active', methods=['PATCH'])
@token_required
@therapist_required
def toggle_active(current_user, exercise_id):
    """Toggle is_active status of a fluency exercise"""
    try:
        # Get current exercise
        exercise = fluency_exercises_collection.find_one({'_id': ObjectId(exercise_id)})
        if not exercise:
            return jsonify({'success': False, 'message': 'Exercise not found'}), 404
        
        # Toggle is_active
        new_status = not exercise.get('is_active', False)
        
        result = fluency_exercises_collection.update_one(
            {'_id': ObjectId(exercise_id)},
            {'$set': {'is_active': new_status, 'updated_at': datetime.datetime.utcnow()}}
        )
        
        return jsonify({
            'success': True,
            'message': f'Exercise is now {"active" if new_status else "inactive"}',
            'is_active': new_status
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
