import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { healthAPI } from '../services/api';

const { width } = Dimensions.get('window');

const HealthScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthLogs, setHealthLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const [logsResponse, summaryResponse] = await Promise.all([
        healthAPI.getLogs(),
        healthAPI.getSummary()
      ]);

      if (logsResponse.success) {
        setHealthLogs(logsResponse.data.logs);
        setSummary(logsResponse.data.summary);
      }
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError(err.message || 'Failed to load health data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthData();
  };

  const getFilteredLogs = () => {
    if (selectedFilter === 'all') {
      return healthLogs;
    }
    return healthLogs.filter(log => log.type === selectedFilter);
  };

  const renderLogCard = (log) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'articulation': return '#FF6B6B';
        case 'fluency': return '#4ECDC4';
        case 'receptive': return '#95E1D3';
        case 'expressive': return '#F38181';
        case 'gait': return '#6B9AC4';
        default: return '#999';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'articulation': return 'mic';
        case 'fluency': return 'chatbubbles';
        case 'receptive': return 'ear';
        case 'expressive': return 'chatbox';
        case 'gait': return 'walk';
        default: return 'fitness';
      }
    };

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    };

    const getScoreColor = (score) => {
      if (score >= 80) return '#4CAF50';
      if (score >= 60) return '#FFC107';
      return '#F44336';
    };

    return (
      <View key={log.id} style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(log.type) }]}>
            <Ionicons name={getTypeIcon(log.type)} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.logHeaderText}>
            <Text style={styles.therapyName}>{log.therapyName}</Text>
            <Text style={styles.logDate}>{formatDate(log.timestamp)}</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(log.score) }]}>
            <Text style={styles.scoreText}>{Math.round(log.score)}</Text>
          </View>
        </View>

        <View style={styles.logDetails}>
          {log.type === 'articulation' && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="volume-high" size={16} color="#666" />
                <Text style={styles.detailText}>Sound: {log.soundId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="layers" size={16} color="#666" />
                <Text style={styles.detailText}>Level {log.level} - {log.target}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="repeat" size={16} color="#666" />
                <Text style={styles.detailText}>Trial #{log.trialNumber}</Text>
              </View>
              {log.details.transcription && (
                <View style={styles.transcriptionBox}>
                  <Text style={styles.transcriptionLabel}>Transcription:</Text>
                  <Text style={styles.transcriptionText}>{log.details.transcription}</Text>
                </View>
              )}
            </>
          )}

          {log.type === 'fluency' && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="layers" size={16} color="#666" />
                <Text style={styles.detailText}>Level {log.level}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="book" size={16} color="#666" />
                <Text style={styles.detailText}>{log.exerciseName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color={log.completed ? '#4CAF50' : '#999'} />
                <Text style={styles.detailText}>{log.completed ? 'Completed' : 'In Progress'}</Text>
              </View>
            </>
          )}

          {(log.type === 'receptive' || log.type === 'expressive') && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="book" size={16} color="#666" />
                <Text style={styles.detailText}>Exercise #{log.exerciseId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name={log.correct ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={log.correct ? '#4CAF50' : '#F44336'} 
                />
                <Text style={styles.detailText}>{log.correct ? 'Correct' : 'Incorrect'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="repeat" size={16} color="#666" />
                <Text style={styles.detailText}>{log.attempts} attempt(s)</Text>
              </View>
            </>
          )}

          {log.type === 'gait' && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="footsteps" size={16} color="#666" />
                <Text style={styles.detailText}>Steps: {log.metrics.stepCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="speedometer" size={16} color="#666" />
                <Text style={styles.detailText}>Cadence: {log.metrics.cadence.toFixed(1)} steps/min</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="resize" size={16} color="#666" />
                <Text style={styles.detailText}>Stride: {log.metrics.strideLength.toFixed(2)}m</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="trending-up" size={16} color="#666" />
                <Text style={styles.detailText}>Speed: {log.metrics.velocity.toFixed(2)} m/s</Text>
              </View>
              <View style={styles.gaitMetricsGrid}>
                <View style={styles.gaitMetricItem}>
                  <Text style={styles.gaitMetricLabel}>Symmetry</Text>
                  <Text style={styles.gaitMetricValue}>
                    {(log.metrics.gaitSymmetry * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.gaitMetricItem}>
                  <Text style={styles.gaitMetricLabel}>Stability</Text>
                  <Text style={styles.gaitMetricValue}>
                    {(log.metrics.stabilityScore * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.gaitMetricItem}>
                  <Text style={styles.gaitMetricLabel}>Regularity</Text>
                  <Text style={styles.gaitMetricValue}>
                    {(log.metrics.stepRegularity * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              <View style={styles.dataQualityBadge}>
                <Ionicons 
                  name={log.dataQuality === 'excellent' || log.dataQuality === 'good' ? 'checkmark-circle' : 'information-circle'} 
                  size={14} 
                  color={log.dataQuality === 'excellent' ? '#4CAF50' : log.dataQuality === 'good' ? '#FFC107' : '#999'} 
                />
                <Text style={styles.dataQualityText}>
                  Data Quality: {log.dataQuality}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Progress Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.totalSessions}</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
              {summary.averageScore}%
            </Text>
            <Text style={styles.summaryLabel}>Avg Score</Text>
          </View>
        </View>

        <View style={styles.therapyBreakdown}>
          <Text style={styles.breakdownTitle}>Sessions by Type</Text>
          
          {summary.articulationSessions > 0 && (
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.breakdownText}>
                Articulation: {summary.articulationSessions}
              </Text>
            </View>
          )}
          
          {summary.fluencySessions > 0 && (
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.breakdownText}>
                Fluency: {summary.fluencySessions}
              </Text>
            </View>
          )}
          
          {summary.receptiveSessions > 0 && (
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: '#95E1D3' }]} />
              <Text style={styles.breakdownText}>
                Receptive: {summary.receptiveSessions}
              </Text>
            </View>
          )}
          
          {summary.expressiveSessions > 0 && (
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: '#F38181' }]} />
              <Text style={styles.breakdownText}>
                Expressive: {summary.expressiveSessions}
              </Text>
            </View>
          )}
          
          {summary.gaitSessions > 0 && (
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: '#6B9AC4' }]} />
              <Text style={styles.breakdownText}>
                Physical Therapy: {summary.gaitSessions}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFilterButtons = () => {
    const filters = [
      { key: 'all', label: 'All', icon: 'apps' },
      { key: 'articulation', label: 'Articulation', icon: 'mic' },
      { key: 'fluency', label: 'Fluency', icon: 'chatbubbles' },
      { key: 'receptive', label: 'Receptive', icon: 'ear' },
      { key: 'expressive', label: 'Expressive', icon: 'chatbox' },
      { key: 'gait', label: 'Physical', icon: 'walk' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons 
              name={filter.icon} 
              size={18} 
              color={selectedFilter === filter.key ? '#FFFFFF' : '#666'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Health Logs</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9302C" />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Health Logs</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#C9302C" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHealthData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Summary Card */}
          {renderSummaryCard()}

          {/* Filter Buttons */}
          {renderFilterButtons()}

          {/* Logs List */}
          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>
              Activity Timeline ({getFilteredLogs().length})
            </Text>
            
            {getFilteredLogs().length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>No therapy sessions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start your therapy exercises to see your progress here
                </Text>
              </View>
            ) : (
              getFilteredLogs().map(log => renderLogCard(log))
            )}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 34,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 34,
  },
  refreshButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#C9302C',
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C9302C',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  therapyBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  breakdownText: {
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  filterContent: {
    paddingRight: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#C9302C',
    borderColor: '#C9302C',
  },
  filterButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  logsContainer: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  therapyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  transcriptionBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  transcriptionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  gaitMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  gaitMetricItem: {
    alignItems: 'center',
  },
  gaitMetricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  gaitMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dataQualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dataQualityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
});

export default HealthScreen;
