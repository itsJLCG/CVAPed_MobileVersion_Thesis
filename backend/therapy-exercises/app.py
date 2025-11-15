"""
Therapy Exercises API Server
Flask-based REST API for managing speech therapy exercises
Handles Fluency, Language (Receptive & Expressive), and Articulation exercises
"""

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Import CRUD blueprints
from fluency_crud import fluency_bp, init_fluency_crud
from language_crud import language_bp, init_language_crud
from receptive_crud import receptive_bp, init_receptive_crud
from articulation_crud import articulation_bp, init_articulation_crud

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

# Register blueprints
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
            'articulation': '/api/articulation-exercises'
        },
        'features': [
            'Fluency therapy exercise management',
            'Language therapy (expressive & receptive)',
            'Articulation therapy by sound',
            'CRUD operations with role-based access',
            'Exercise seeding functionality',
            'Active/inactive toggle for exercises'
        ]
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('THERAPY_PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print("=" * 60)
    print("🎯 Therapy Exercises API Server")
    print("=" * 60)
    print(f"📍 Running on: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"💾 Database: {DB_NAME}")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
