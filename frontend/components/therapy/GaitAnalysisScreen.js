import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import gaitAnalysisAPI from '../../services/gaitApi';

const GaitAnalysisScreen = ({ onBack }) => {
  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sensorData, setSensorData] = useState({
    accelerometer: [],
    gyroscope: [],
  });

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Sensor subscriptions
  const accelerometerSubscription = useRef(null);
  const gyroscopeSubscription = useRef(null);
  const timerInterval = useRef(null);

  // Pulse animation for recording button
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Start recording sensor data
  const startRecording = async () => {
    try {
      console.log('=== Starting Sensor Recording ===');
      
      // Set update intervals (100ms = 10Hz)
      Accelerometer.setUpdateInterval(100);
      Gyroscope.setUpdateInterval(100);

      // Clear previous data
      setSensorData({ accelerometer: [], gyroscope: [] });
      setRecordingTime(0);
      setAnalysisResult(null);

      console.log('Subscribing to accelerometer...');
      // Subscribe to accelerometer
      accelerometerSubscription.current = Accelerometer.addListener((data) => {
        setSensorData((prev) => ({
          ...prev,
          accelerometer: [
            ...prev.accelerometer,
            {
              x: data.x,
              y: data.y,
              z: data.z,
              timestamp: Date.now(),
            },
          ],
        }));
      });

      console.log('Subscribing to gyroscope...');
      // Subscribe to gyroscope
      gyroscopeSubscription.current = Gyroscope.addListener((data) => {
        setSensorData((prev) => ({
          ...prev,
          gyroscope: [
            ...prev.gyroscope,
            {
              x: data.x,
              y: data.y,
              z: data.z,
              timestamp: Date.now(),
            },
          ],
        }));
      });

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime % 5 === 0) {
            console.log(`Recording: ${newTime}s`);
          }
          return newTime;
        });
      }, 1000);

      setIsRecording(true);
      console.log('Recording started successfully');
      
      Alert.alert(
        'Recording Started',
        'Walk normally for at least 30 seconds. The app is collecting data from your phone\'s sensors.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to access device sensors: ' + error.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('=== Stopping Recording ===');
    console.log('Accelerometer samples:', sensorData.accelerometer.length);
    console.log('Gyroscope samples:', sensorData.gyroscope.length);
    
    // Unsubscribe from sensors
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
      accelerometerSubscription.current = null;
    }
    if (gyroscopeSubscription.current) {
      gyroscopeSubscription.current.remove();
      gyroscopeSubscription.current = null;
    }

    // Stop timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    setIsRecording(false);

    // Check if we have enough data
    if (sensorData.accelerometer.length < 10 || sensorData.gyroscope.length < 10) {
      Alert.alert(
        'Insufficient Data',
        `Only collected ${sensorData.accelerometer.length} samples. Please record for at least 10 seconds.`,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setSensorData({ accelerometer: [], gyroscope: [] });
              setRecordingTime(0);
            },
          },
        ]
      );
    } else if (recordingTime < 10) {
      Alert.alert(
        'Recording Too Short',
        'Please record for at least 10 seconds for accurate analysis.',
        [
          {
            text: 'Record Again',
            onPress: () => {
              setSensorData({ accelerometer: [], gyroscope: [] });
              setRecordingTime(0);
            },
          },
          { text: 'Analyze Anyway', onPress: analyzeGait },
        ]
      );
    } else {
      console.log('Data looks good, starting analysis...');
      analyzeGait();
    }
  };

  // Analyze gait data
  const analyzeGait = async () => {
    setIsAnalyzing(true);
    try {
      console.log('=== Starting Gait Analysis ===');
      console.log('Total samples collected:', sensorData.accelerometer.length);
      console.log('Recording duration:', recordingTime, 'seconds');
      
      // Prepare data for backend - match the Python backend format
      const requestData = {
        accelerometer: sensorData.accelerometer,
        gyroscope: sensorData.gyroscope,
        user_id: 'test-user', // TODO: Get from auth context
        session_id: `session-${Date.now()}`,
      };

      console.log('Sending data to backend:', {
        accelerometer_samples: requestData.accelerometer.length,
        gyroscope_samples: requestData.gyroscope.length,
        user_id: requestData.user_id,
      });

      const result = await gaitAnalysisAPI.analyzeGait(requestData);

      console.log('=== Backend Response ===');
      console.log('Full response:', JSON.stringify(result, null, 2));

      // Check if we got valid data back
      if (result && result.success !== false) {
        // Handle different response formats
        const analysisData = result.data || result.analysis || result;
        
        console.log('Analysis data:', analysisData);
        
        setAnalysisResult(analysisData);
        
        Alert.alert(
          'Analysis Complete',
          `Found ${analysisData.stepCount || 0} steps!`,
          [{ text: 'View Results' }]
        );
      } else {
        throw new Error(result.error || 'Analysis returned no data');
      }
    } catch (error) {
      console.error('=== Analysis Error ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      
      setAnalysisResult({
        stepCount: 0,
        cadence: 0,
        walkingSpeed: 0,
        symmetryIndex: 0,
        stabilityScore: 0,
        stepLength: 0,
        error: error.message,
      });
      
      Alert.alert(
        'Analysis Error',
        `Failed to analyze: ${error.message}\n\nCheck console for details.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
      if (gyroscopeSubscription.current) {
        gyroscopeSubscription.current.remove();
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gait Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions Card */}
        {!analysisResult && (
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={30} color="#C9302C" />
            <Text style={styles.instructionsTitle}>How to Perform Gait Analysis</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Hold your phone in your hand or pocket
                </Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Tap "Start Recording" and begin walking normally
                </Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Walk for at least 30 seconds for best results
                </Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Tap "Stop Recording" when finished
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>
              {isRecording ? 'Recording Time' : 'Ready to Record'}
            </Text>
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            {isRecording && (
              <Text style={styles.dataCount}>
                {sensorData.accelerometer.length} samples collected
              </Text>
            )}
          </View>

          {/* Record Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'play'}
                size={60}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordButtonLabel}>
            {isRecording ? 'Tap to Stop Recording' : 'Tap to Start Recording'}
          </Text>
        </View>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C9302C" />
            <Text style={styles.loadingText}>Analyzing your gait...</Text>
            <Text style={styles.loadingSubtext}>
              Processing {sensorData.accelerometer.length} sensor readings
            </Text>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && !isAnalyzing && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Ionicons name="checkmark-circle" size={40} color="#27AE60" />
              <Text style={styles.resultsTitle}>Analysis Complete!</Text>
              <Text style={styles.dataQuality}>
                Data Quality: {analysisResult.data_quality || 'good'}
              </Text>
            </View>

            {/* Show error if present */}
            {analysisResult.error && (
              <View style={styles.errorCard}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <Text style={styles.errorText}>
                  {analysisResult.error}
                </Text>
              </View>
            )}

            {/* Metrics Grid - Updated to match backend response */}
            <View style={styles.metricsGrid}>
              {/* Step Count */}
              <View style={styles.metricCardFull}>
                <View style={styles.metricHeader}>
                  <Ionicons name="footsteps" size={30} color="#C9302C" />
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricValue}>
                      {analysisResult.metrics?.step_count || 0}
                    </Text>
                    <Text style={styles.metricLabel}>Steps Detected</Text>
                  </View>
                </View>
                <Text style={styles.metricExplanation}>
                  {analysisResult.metrics?.step_count > 0 
                    ? analysisResult.metrics.step_count < 15
                      ? "Few steps detected. Try walking longer for better analysis."
                      : analysisResult.metrics.step_count < 30
                      ? "Good number of steps for basic analysis."
                      : "Excellent! Enough steps for accurate analysis."
                    : "No steps detected. Make sure to walk while recording."}
                </Text>
              </View>

              {/* Cadence */}
              <View style={styles.metricCard}>
                <Ionicons name="speedometer" size={28} color="#3498DB" />
                <Text style={styles.metricValue}>
                  {analysisResult.metrics?.cadence?.toFixed(1) || '0'}
                </Text>
                <Text style={styles.metricLabel}>Steps/min</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.cadence >= 100 
                    ? "Fast pace"
                    : analysisResult.metrics?.cadence >= 80
                    ? "Normal pace"
                    : analysisResult.metrics?.cadence > 0
                    ? "Slow pace"
                    : "No data"}
                </Text>
              </View>

              {/* Walking Speed */}
              <View style={styles.metricCard}>
                <Ionicons name="walk" size={28} color="#9B59B6" />
                <Text style={styles.metricValue}>
                  {analysisResult.metrics?.velocity?.toFixed(2) || '0'}
                </Text>
                <Text style={styles.metricLabel}>m/s</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.velocity >= 1.2
                    ? "Fast walker"
                    : analysisResult.metrics?.velocity >= 0.8
                    ? "Average speed"
                    : analysisResult.metrics?.velocity > 0
                    ? "Slow walk"
                    : "No movement"}
                </Text>
              </View>

              {/* Gait Symmetry */}
              <View style={styles.metricCard}>
                <Ionicons name="git-compare" size={28} color="#E67E22" />
                <Text style={styles.metricValue}>
                  {((analysisResult.metrics?.gait_symmetry || 0) * 100).toFixed(0)}%
                </Text>
                <Text style={styles.metricLabel}>Symmetry</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.gait_symmetry >= 0.9
                    ? "Excellent!"
                    : analysisResult.metrics?.gait_symmetry >= 0.7
                    ? "Good balance"
                    : analysisResult.metrics?.gait_symmetry > 0
                    ? "Needs attention"
                    : "No data"}
                </Text>
              </View>

              {/* Stability Score */}
              <View style={styles.metricCard}>
                <Ionicons name="shield-checkmark" size={28} color="#27AE60" />
                <Text style={styles.metricValue}>
                  {((analysisResult.metrics?.stability_score || 0) * 100).toFixed(0)}%
                </Text>
                <Text style={styles.metricLabel}>Stability</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.stability_score >= 0.8
                    ? "Very stable"
                    : analysisResult.metrics?.stability_score >= 0.6
                    ? "Moderate"
                    : analysisResult.metrics?.stability_score > 0
                    ? "Unstable"
                    : "No data"}
                </Text>
              </View>

              {/* Stride Length */}
              <View style={styles.metricCard}>
                <Ionicons name="resize" size={28} color="#E74C3C" />
                <Text style={styles.metricValue}>
                  {analysisResult.metrics?.stride_length?.toFixed(2) || '0'}
                </Text>
                <Text style={styles.metricLabel}>Stride (m)</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.stride_length >= 1.2
                    ? "Long strides"
                    : analysisResult.metrics?.stride_length >= 0.8
                    ? "Normal"
                    : analysisResult.metrics?.stride_length > 0
                    ? "Short strides"
                    : "No data"}
                </Text>
              </View>

              {/* Step Regularity */}
              <View style={styles.metricCard}>
                <Ionicons name="pulse" size={28} color="#16A085" />
                <Text style={styles.metricValue}>
                  {((analysisResult.metrics?.step_regularity || 0) * 100).toFixed(0)}%
                </Text>
                <Text style={styles.metricLabel}>Regularity</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.step_regularity >= 0.8
                    ? "Very consistent"
                    : analysisResult.metrics?.step_regularity >= 0.6
                    ? "Fairly regular"
                    : analysisResult.metrics?.step_regularity > 0
                    ? "Irregular"
                    : "No data"}
                </Text>
              </View>

              {/* Vertical Oscillation */}
              <View style={styles.metricCard}>
                <Ionicons name="trending-up" size={28} color="#8E44AD" />
                <Text style={styles.metricValue}>
                  {(analysisResult.metrics?.vertical_oscillation * 100)?.toFixed(1) || '0'}
                </Text>
                <Text style={styles.metricLabel}>Bounce (cm)</Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.metrics?.vertical_oscillation >= 0.08
                    ? "High bounce"
                    : analysisResult.metrics?.vertical_oscillation >= 0.05
                    ? "Normal"
                    : analysisResult.metrics?.vertical_oscillation > 0
                    ? "Low bounce"
                    : "No data"}
                </Text>
              </View>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📋 Summary</Text>
              <Text style={styles.summaryText}>
                {analysisResult.metrics?.step_count > 0
                  ? `You took ${analysisResult.metrics.step_count} steps in ${analysisResult.analysis_duration?.toFixed(0)}s. ` +
                    `Your walking pattern shows ${
                      analysisResult.metrics.gait_symmetry >= 0.9 ? "excellent" :
                      analysisResult.metrics.gait_symmetry >= 0.7 ? "good" : "fair"
                    } symmetry and ${
                      analysisResult.metrics.stability_score >= 0.8 ? "strong" :
                      analysisResult.metrics.stability_score >= 0.6 ? "moderate" : "low"
                    } stability. ${
                      analysisResult.metrics.step_regularity >= 0.8
                        ? "Your steps are very consistent!"
                        : analysisResult.metrics.step_regularity >= 0.6
                        ? "Your steps show good regularity."
                        : "Try to maintain a more consistent walking rhythm."
                    }`
                  : "No steps were detected during this recording. Make sure to walk normally while recording for at least 30 seconds."}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setSensorData({ accelerometer: [], gyroscope: [] });
                  setAnalysisResult(null);
                  setRecordingTime(0);
                }}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>New Analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => {
                  // TODO: Save results to database
                  Alert.alert('Success', 'Results saved to your history!');
                }}
              >
                <Ionicons name="save" size={20} color="#C9302C" />
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                  Save Results
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },

  // Instructions Card
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 15,
  },
  stepsList: {
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    paddingTop: 4,
  },

  // Recording Section
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    fontVariant: ['tabular-nums'],
  },
  dataCount: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 5,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#C9302C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonActive: {
    backgroundColor: '#E74C3C',
  },
  recordButtonLabel: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
  },

  // Results
  resultsContainer: {
    margin: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 10,
  },
  dataQuality: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricCardFull: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricInfo: {
    marginLeft: 15,
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  metricSubtext: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  metricExplanation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    textAlign: 'left',
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#C9302C',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C9302C',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#C9302C',
  },
  
  // Debug and Error Cards
  errorCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  errorText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
  },
  debugCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default GaitAnalysisScreen;
