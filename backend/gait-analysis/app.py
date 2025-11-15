"""
Gait Analysis Backend - Main Flask Application
Processes gyroscope and accelerometer data from mobile devices
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import os
from dotenv import load_dotenv

from gait_processor import GaitProcessor
from data_validator import validate_sensor_data

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Initialize gait processor
gait_processor = GaitProcessor()

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Gait Analysis API'
    }), 200


@app.route('/api/gait/analyze', methods=['POST'])
def analyze_gait():
    """
    Analyze gait data from accelerometer and gyroscope
    
    Expected JSON payload:
    {
        "accelerometer": [
            {"x": float, "y": float, "z": float, "timestamp": float},
            ...
        ],
        "gyroscope": [
            {"x": float, "y": float, "z": float, "timestamp": float},
            ...
        ],
        "user_id": string (optional),
        "session_id": string (optional)
    }
    """
    try:
        print("\n" + "="*50)
        print("GAIT ANALYSIS REQUEST RECEIVED")
        print("="*50)
        
        data = request.get_json()
        
        print(f"Request data keys: {list(data.keys())}")
        print(f"Accelerometer samples: {len(data.get('accelerometer', []))}")
        print(f"Gyroscope samples: {len(data.get('gyroscope', []))}")
        print(f"User ID: {data.get('user_id', 'not provided')}")
        print(f"Session ID: {data.get('session_id', 'not provided')}")
        
        # Show sample data
        if data.get('accelerometer') and len(data['accelerometer']) > 0:
            print(f"\nFirst accelerometer sample: {data['accelerometer'][0]}")
            print(f"Last accelerometer sample: {data['accelerometer'][-1]}")
        
        # Validate input data
        validation_result = validate_sensor_data(data)
        if not validation_result['valid']:
            print(f"VALIDATION FAILED: {validation_result['errors']}")
            return jsonify({
                'success': False,
                'error': 'Invalid data',
                'details': validation_result['errors']
            }), 400
        
        print("Data validation passed ✓")
        
        # Extract sensor data
        accel_data = data.get('accelerometer', [])
        gyro_data = data.get('gyroscope', [])
        user_id = data.get('user_id', 'anonymous')
        session_id = data.get('session_id', datetime.now().isoformat())
        
        print(f"\nProcessing gait analysis...")
        # Process gait data
        analysis_result = gait_processor.analyze(
            accelerometer=accel_data,
            gyroscope=gyro_data,
            user_id=user_id,
            session_id=session_id
        )
        
        print(f"\nAnalysis complete!")
        print(f"Results: {analysis_result}")
        print("="*50 + "\n")
        
        return jsonify({
            'success': True,
            'data': analysis_result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"\n{'!'*50}")
        print(f"ERROR IN GAIT ANALYSIS: {str(e)}")
        print(f"{'!'*50}\n")
        app.logger.error(f"Error analyzing gait data: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/gait/realtime', methods=['POST'])
def realtime_analysis():
    """
    Real-time gait analysis for streaming data
    Processes smaller chunks of data for immediate feedback
    """
    try:
        data = request.get_json()
        
        # Extract sensor readings
        accel = data.get('accelerometer', {})
        gyro = data.get('gyroscope', {})
        
        # Process single reading
        result = gait_processor.process_realtime(
            accelerometer=accel,
            gyroscope=gyro
        )
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in realtime analysis: {str(e)}")
        return jsonify({
            'error': 'Processing error',
            'message': str(e)
        }), 500


@app.route('/api/gait/history/<user_id>', methods=['GET'])
def get_user_history(user_id):
    """Get gait analysis history for a specific user"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        
        history = gait_processor.get_user_history(user_id, limit=limit)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'history': history
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching history: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch history',
            'message': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('GAIT_ANALYSIS_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting Gait Analysis Server on port {port}...")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
