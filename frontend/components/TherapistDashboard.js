import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const TherapistDashboard = ({ onLogout, onNavigate }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('receptive');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fluency states
  const [fluencyExercises, setFluencyExercises] = useState({});
  const [showFluencyModal, setShowFluencyModal] = useState(false);
  const [editingFluency, setEditingFluency] = useState(null);
  const [newFluency, setNewFluency] = useState({
    level: 1,
    type: 'controlled-breathing',
    instruction: '',
    target: '',
    expected_duration: 3,
    breathing: true,
    order: 1,
    is_active: true
  });
  
  // Language states
  const [languageExercises, setLanguageExercises] = useState({});
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [newLanguage, setNewLanguage] = useState({
    level: 1,
    type: 'description',
    instruction: '',
    prompt: '',
    expected_keywords: '',
    min_words: 5,
    order: 1,
    is_active: true
  });
  
  // Receptive states
  const [receptiveExercises, setReceptiveExercises] = useState({});
  const [showReceptiveModal, setShowReceptiveModal] = useState(false);
  const [editingReceptive, setEditingReceptive] = useState(null);
  const [newReceptive, setNewReceptive] = useState({
    level: 1,
    type: 'vocabulary',
    instruction: '',
    target: '',
    options: [
      { text: '', emoji: '' },
      { text: '', emoji: '' },
      { text: '', emoji: '' },
      { text: '', emoji: '' }
    ],
    correct_answer: 0,
    order: 1,
    is_active: true
  });
  
  // Articulation states
  const [articulationExercises, setArticulationExercises] = useState({});
  const [activeSound, setActiveSound] = useState('s');
  const [showArticulationModal, setShowArticulationModal] = useState(false);
  const [editingArticulation, setEditingArticulation] = useState(null);
  const [newArticulation, setNewArticulation] = useState({
    sound_id: 's',
    level: 1,
    target: '',
    order: 1,
    is_active: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'fluency') {
      loadFluencyExercises();
    } else if (activeTab === 'language' && activeSubTab === 'expressive') {
      loadLanguageExercises();
    } else if (activeTab === 'language' && activeSubTab === 'receptive') {
      loadReceptiveExercises();
    } else if (activeTab === 'articulation') {
      loadArticulationExercises();
    }
  }, [activeTab, activeSubTab]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'fluency') {
      await loadFluencyExercises();
    } else if (activeTab === 'language' && activeSubTab === 'expressive') {
      await loadLanguageExercises();
    } else if (activeTab === 'language' && activeSubTab === 'receptive') {
      await loadReceptiveExercises();
    } else if (activeTab === 'articulation') {
      await loadArticulationExercises();
    }
    setRefreshing(false);
  };

  // ==================== FLUENCY FUNCTIONS ====================
  const loadFluencyExercises = async () => {
    setLoading(true);
    try {
      const data = await api.therapyAPI.fluency.getAll();
      
      if (data.success) {
        // Group exercises by level
        const grouped = {};
        data.exercises.forEach(ex => {
          if (!grouped[ex.level]) {
            grouped[ex.level] = {
              name: ex.level_name,
              color: ex.level_color,
              exercises: []
            };
          }
          grouped[ex.level].exercises.push(ex);
        });
        setFluencyExercises(grouped);
      }
    } catch (error) {
      console.error('Failed to load fluency exercises:', error);
      Alert.alert('Error', 'Failed to load fluency exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedFluency = async () => {
    Alert.alert(
      'Seed Fluency Exercises',
      'This will add default fluency exercises to the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            try {
              const data = await api.therapyAPI.fluency.seed();
              
              if (data.success) {
                Alert.alert('Success', `Seeded ${data.count} exercises!`);
                loadFluencyExercises();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to seed exercises');
            }
          }
        }
      ]
    );
  };

  const toggleFluencyActive = async (exerciseId, currentStatus) => {
    try {
      const data = await api.therapyAPI.fluency.toggleActive(exerciseId);
      
      if (data.success) {
        loadFluencyExercises();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle exercise status');
    }
  };

  const deleteFluencyExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await api.therapyAPI.fluency.delete(exerciseId);
              
              if (data.success) {
                Alert.alert('Success', 'Exercise deleted');
                loadFluencyExercises();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleCreateFluency = async () => {
    try {
      const data = await api.therapyAPI.fluency.create(newFluency);
      
      if (data.success) {
        setShowFluencyModal(false);
        setNewFluency({
          level: 1,
          level_name: 'Breathing & Single Words',
          level_color: '#e8b04e',
          order: 1,
          exercise_id: '',
          type: '',
          instruction: '',
          target: '',
          expected_duration: 3,
          breathing: true,
          is_active: false
        });
        loadFluencyExercises();
        Alert.alert('Success', 'Exercise created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateFluency = async () => {
    try {
      // Send only the editable fields
      const updates = {
        level: editingFluency.level,
        type: editingFluency.type,
        instruction: editingFluency.instruction,
        target: editingFluency.target,
        expected_duration: editingFluency.expected_duration,
        breathing: editingFluency.breathing,
        is_active: editingFluency.is_active
      };
      
      const data = await api.therapyAPI.fluency.update(editingFluency._id, updates);
      
      if (data.success) {
        setEditingFluency(null);
        loadFluencyExercises();
        Alert.alert('Success', 'Exercise updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAddFluencyModal = () => {
    setEditingFluency(null);
    setShowFluencyModal(true);
  };

  const openEditFluencyModal = (exercise) => {
    setEditingFluency(exercise);
    setShowFluencyModal(true);
  };

  // ==================== LANGUAGE (EXPRESSIVE) FUNCTIONS ====================
  const loadLanguageExercises = async () => {
    setLoading(true);
    try {
      const data = await api.therapyAPI.language.getAll();
      
      if (data.success) {
        const grouped = {};
        data.exercises.forEach(ex => {
          if (!grouped[ex.level]) {
            grouped[ex.level] = {
              name: ex.level_name,
              color: ex.level_color,
              exercises: []
            };
          }
          grouped[ex.level].exercises.push(ex);
        });
        setLanguageExercises(grouped);
      }
    } catch (error) {
      console.error('Failed to load language exercises:', error);
      Alert.alert('Error', 'Failed to load language exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLanguage = async () => {
    Alert.alert(
      'Seed Expressive Language Exercises',
      'This will add default exercises. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            try {
              const data = await api.therapyAPI.language.seed();
              
              if (data.success) {
                Alert.alert('Success', `Seeded ${data.count} exercises!`);
                loadLanguageExercises();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to seed exercises');
            }
          }
        }
      ]
    );
  };

  const toggleLanguageActive = async (exerciseId) => {
    try {
      const data = await api.therapyAPI.language.toggleActive(exerciseId);
      
      if (data.success) {
        loadLanguageExercises();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle exercise status');
    }
  };

  const deleteLanguageExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.therapyAPI.language.delete(exerciseId);
              loadLanguageExercises();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleCreateLanguage = async () => {
    try {
      // Convert comma-separated keywords to array
      let exerciseData = { ...newLanguage };
      if (typeof exerciseData.expected_keywords === 'string') {
        exerciseData.expected_keywords = exerciseData.expected_keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k);
      }
      
      const data = await api.therapyAPI.language.create(exerciseData);
      
      if (data.success) {
        setShowLanguageModal(false);
        setNewLanguage({
          level: 1,
          order: 1,
          type: 'description',
          instruction: '',
          prompt: '',
          expected_keywords: '',
          min_words: 5,
          is_active: true
        });
        loadLanguageExercises();
        Alert.alert('Success', 'Exercise created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateLanguage = async () => {
    try {
      // Send only the editable fields
      const updates = {
        level: editingLanguage.level,
        order: editingLanguage.order,
        type: editingLanguage.type,
        instruction: editingLanguage.instruction,
        prompt: editingLanguage.prompt,
        expected_keywords: editingLanguage.expected_keywords,
        min_words: editingLanguage.min_words,
        is_active: editingLanguage.is_active
      };
      
      const data = await api.therapyAPI.language.update(editingLanguage._id, updates);
      
      if (data.success) {
        setEditingLanguage(null);
        loadLanguageExercises();
        Alert.alert('Success', 'Exercise updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAddLanguageModal = () => {
    setEditingLanguage(null);
    setShowLanguageModal(true);
  };

  const openEditLanguageModal = (exercise) => {
    setEditingLanguage(exercise);
    setShowLanguageModal(true);
  };

  // ==================== RECEPTIVE FUNCTIONS ====================
  const loadReceptiveExercises = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await api.therapyAPI.receptive.getAll(token);
      
      if (data.success) {
        const grouped = {};
        data.exercises.forEach(ex => {
          if (!grouped[ex.level]) {
            grouped[ex.level] = {
              name: ex.level_name,
              color: ex.level_color,
              exercises: []
            };
          }
          grouped[ex.level].exercises.push(ex);
        });
        setReceptiveExercises(grouped);
      }
    } catch (error) {
      console.error('Failed to load receptive exercises:', error);
      Alert.alert('Error', 'Failed to load receptive exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedReceptive = async () => {
    Alert.alert(
      'Seed Receptive Language Exercises',
      'This will add default exercises. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const data = await api.therapyAPI.receptive.seed(token);
              
              if (data.success) {
                Alert.alert('Success', `Seeded ${data.count} exercises!`);
                loadReceptiveExercises();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to seed exercises');
            }
          }
        }
      ]
    );
  };

  const toggleReceptiveActive = async (exerciseId) => {
    try {
      const data = await api.therapyAPI.receptive.toggleActive(exerciseId);
      
      if (data.success) {
        loadReceptiveExercises();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle exercise status');
    }
  };

  const deleteReceptiveExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.therapyAPI.receptive.delete(exerciseId);
              loadReceptiveExercises();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleCreateReceptive = async () => {
    try {
      // Transform options from form format {text, emoji} to simple strings for backend
      const optionsToSend = newReceptive.options.map(opt => opt.text);
      
      const dataToSend = {
        level: newReceptive.level,
        type: newReceptive.type,
        instruction: newReceptive.instruction,
        target: newReceptive.target,
        options: optionsToSend,
        options_emojis: newReceptive.options.map(opt => opt.emoji),
        correct_answer: newReceptive.correct_answer,
        order: newReceptive.order,
        is_active: newReceptive.is_active
      };
      
      const data = await api.therapyAPI.receptive.create(dataToSend);
      
      if (data.success) {
        setShowReceptiveModal(false);
        setNewReceptive({
          level: 1,
          type: 'vocabulary',
          instruction: '',
          target: '',
          options: [
            { text: '', emoji: '' },
            { text: '', emoji: '' },
            { text: '', emoji: '' },
            { text: '', emoji: '' }
          ],
          correct_answer: 0,
          order: 1,
          is_active: true
        });
        loadReceptiveExercises();
        Alert.alert('Success', 'Exercise created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateReceptive = async () => {
    try {
      // Transform options from form format {text, emoji} to simple strings for backend
      const optionsToSend = editingReceptive.options.map(opt => opt.text);
      
      // Send only the editable fields
      const updates = {
        level: editingReceptive.level,
        type: editingReceptive.type,
        instruction: editingReceptive.instruction,
        target: editingReceptive.target,
        options: optionsToSend,
        options_emojis: editingReceptive.options.map(opt => opt.emoji),
        correct_answer: editingReceptive.correct_answer,
        order: editingReceptive.order,
        is_active: editingReceptive.is_active
      };
      
      const data = await api.therapyAPI.receptive.update(editingReceptive._id, updates);
      
      if (data.success) {
        setEditingReceptive(null);
        loadReceptiveExercises();
        Alert.alert('Success', 'Exercise updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAddReceptiveModal = () => {
    setEditingReceptive(null);
    setShowReceptiveModal(true);
  };

  const openEditReceptiveModal = (exercise) => {
    // Transform options from backend format (with image/shape) to form format (with emoji)
    const transformedExercise = {
      ...exercise,
      options: exercise.options.map(opt => ({
        text: opt.text || '',
        emoji: opt.image || opt.shape || ''
      }))
    };
    setEditingReceptive(transformedExercise);
    setShowReceptiveModal(true);
  };

  // ==================== ARTICULATION FUNCTIONS ====================
  const loadArticulationExercises = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await api.therapyAPI.articulation.getAll(token);
      
      if (data.success) {
        setArticulationExercises(data.exercises_by_sound || {});
      }
    } catch (error) {
      console.error('Failed to load articulation exercises:', error);
      Alert.alert('Error', 'Failed to load articulation exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedArticulation = async () => {
    Alert.alert(
      'Seed Articulation Exercises',
      'This will add default exercises for all sounds. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const data = await api.therapyAPI.articulation.seed(token);
              
              if (data.success) {
                Alert.alert('Success', `Seeded ${data.count} exercises!`);
                loadArticulationExercises();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to seed exercises');
            }
          }
        }
      ]
    );
  };

  const toggleArticulationActive = async (exerciseId) => {
    try {
      const data = await api.therapyAPI.articulation.toggleActive(exerciseId);
      
      if (data.success) {
        loadArticulationExercises();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle exercise status');
    }
  };

  const deleteArticulationExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.therapyAPI.articulation.delete(exerciseId);
              loadArticulationExercises();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleCreateArticulation = async () => {
    try {
      const data = await api.therapyAPI.articulation.create(newArticulation);
      
      if (data.success) {
        setShowArticulationModal(false);
        setNewArticulation({
          sound_id: activeSound,
          level: 1,
          target: '',
          order: 1,
          is_active: false
        });
        loadArticulationExercises();
        Alert.alert('Success', 'Exercise created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateArticulation = async () => {
    try {
      // Send only the editable fields
      const updates = {
        sound_id: editingArticulation.sound_id,
        level: editingArticulation.level,
        target: editingArticulation.target,
        order: editingArticulation.order,
        is_active: editingArticulation.is_active
      };
      
      const data = await api.therapyAPI.articulation.update(editingArticulation._id, updates);
      
      if (data.success) {
        setEditingArticulation(null);
        loadArticulationExercises();
        Alert.alert('Success', 'Exercise updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAddArticulationModal = () => {
    setEditingArticulation(null);
    setNewArticulation({ ...newArticulation, sound_id: activeSound });
    setShowArticulationModal(true);
  };

  const openEditArticulationModal = (exercise) => {
    setEditingArticulation(exercise);
    setShowArticulationModal(true);
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.welcomeCard}>
        <Ionicons name="person-circle" size={70} color="#C9302C" />
        <Text style={styles.welcomeTitle}>Welcome, Therapist!</Text>
        <Text style={styles.welcomeName}>{user?.firstName || 'User'}</Text>
        <Text style={styles.welcomeSubtitle}>
          Use the tabs below to manage therapy exercises for all speech therapy categories.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={22} color="#C9302C" />
        <Text style={styles.infoText}>
          You can create, edit, activate/deactivate, and delete exercises for:
        </Text>
        <View style={styles.categoryList}>
          <Text style={styles.categoryItem}>• Fluency Therapy (5 levels)</Text>
          <Text style={styles.categoryItem}>• Expressive Language (3 levels)</Text>
          <Text style={styles.categoryItem}>• Receptive Language (3 levels)</Text>
          <Text style={styles.categoryItem}>• Articulation (5 sounds × 5 levels)</Text>
        </View>
      </View>
    </View>
  );

  const renderFluencyTab = () => {
    const levelColors = {
      1: '#e8b04e',
      2: '#479ac3',
      3: '#ce3630',
      4: '#8e44ad',
      5: '#27ae60'
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.tabHeader}>
          <Text style={styles.tabTitle}>Fluency Exercise Management</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addButton} onPress={openAddFluencyModal}>
              <Ionicons name="add-circle" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.seedButton} onPress={handleSeedFluency}>
              <Ionicons name="download" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Seed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <ScrollView 
            style={styles.exercisesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {Object.keys(fluencyExercises).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={60} color="#CCC" />
                <Text style={styles.emptyText}>No exercises yet</Text>
                <Text style={styles.emptySubtext}>Tap "Seed Default" to add exercises</Text>
              </View>
            ) : (
              Object.keys(fluencyExercises).sort((a, b) => Number(a) - Number(b)).map(level => (
                <View key={level} style={styles.levelSection}>
                  <View style={[styles.levelHeader, { backgroundColor: levelColors[level] }]}>
                    <Text style={styles.levelTitle}>Level {level}: {fluencyExercises[level].name}</Text>
                    <Text style={styles.exerciseCount}>
                      {fluencyExercises[level].exercises.length} exercises
                    </Text>
                  </View>
                  
                  {fluencyExercises[level].exercises.map((exercise, idx) => (
                    <View key={exercise._id} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseId}>{exercise.exercise_id}</Text>
                          <Text style={styles.exerciseType}>{exercise.type}</Text>
                        </View>
                        <View style={styles.exerciseActions}>
                          <TouchableOpacity 
                            onPress={() => toggleFluencyActive(exercise._id, exercise.is_active)}
                            style={[styles.statusBadge, exercise.is_active ? styles.activeBadge : styles.inactiveBadge]}
                          >
                            <Text style={styles.statusText}>
                              {exercise.is_active ? 'Active' : 'Inactive'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => openEditFluencyModal(exercise)}
                            style={styles.editBtn}
                          >
                            <Ionicons name="create-outline" size={18} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => deleteFluencyExercise(exercise._id)}
                            style={styles.deleteBtn}
                          >
                            <Ionicons name="trash" size={18} color="#C9302C" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={styles.exerciseInstruction}>{exercise.instruction}</Text>
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.detailText}>Target: {exercise.target}</Text>
                        <Text style={styles.detailText}>Duration: {exercise.expected_duration}s</Text>
                        {exercise.breathing && (
                          <View style={styles.breathingBadge}>
                            <Text style={styles.breathingText}>🫁 Breathing</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderLanguageTab = () => {
    const exercises = activeSubTab === 'expressive' ? languageExercises : receptiveExercises;
    const handleSeed = activeSubTab === 'expressive' ? handleSeedLanguage : handleSeedReceptive;
    const handleToggle = activeSubTab === 'expressive' ? toggleLanguageActive : toggleReceptiveActive;
    const handleDelete = activeSubTab === 'expressive' ? deleteLanguageExercise : deleteReceptiveExercise;
    const handleAdd = activeSubTab === 'expressive' ? openAddLanguageModal : openAddReceptiveModal;
    const handleEdit = activeSubTab === 'expressive' ? openEditLanguageModal : openEditReceptiveModal;

    return (
      <View style={styles.tabContent}>
        <View style={styles.subTabContainer}>
          <TouchableOpacity 
            style={[styles.subTab, activeSubTab === 'receptive' && styles.subTabActive]}
            onPress={() => setActiveSubTab('receptive')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'receptive' && styles.subTabTextActive]}>
              Receptive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.subTab, activeSubTab === 'expressive' && styles.subTabActive]}
            onPress={() => setActiveSubTab('expressive')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'expressive' && styles.subTabTextActive]}>
              Expressive
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabHeader}>
          <Text style={styles.tabTitle}>
            {activeSubTab === 'expressive' ? 'Expressive' : 'Receptive'} Language
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Ionicons name="add-circle" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.seedButton} onPress={handleSeed}>
              <Ionicons name="download" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Seed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <ScrollView 
            style={styles.exercisesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {Object.keys(exercises).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={60} color="#CCC" />
                <Text style={styles.emptyText}>No exercises yet</Text>
                <Text style={styles.emptySubtext}>Tap "Seed" to add exercises</Text>
              </View>
            ) : (
              Object.keys(exercises).sort((a, b) => Number(a) - Number(b)).map(level => (
                <View key={level} style={styles.levelSection}>
                  <View style={[styles.levelHeader, { backgroundColor: exercises[level].color }]}>
                    <Text style={styles.levelTitle}>Level {level}: {exercises[level].name}</Text>
                    <Text style={styles.exerciseCount}>
                      {exercises[level].exercises.length} exercises
                    </Text>
                  </View>
                  
                  {exercises[level].exercises.map((exercise) => (
                    <View key={exercise._id} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseId}>{exercise.exercise_id}</Text>
                          <Text style={styles.exerciseType}>{exercise.type}</Text>
                        </View>
                        <View style={styles.exerciseActions}>
                          <TouchableOpacity 
                            onPress={() => handleToggle(exercise._id)}
                            style={[styles.statusBadge, exercise.is_active ? styles.activeBadge : styles.inactiveBadge]}
                          >
                            <Text style={styles.statusText}>
                              {exercise.is_active ? 'Active' : 'Inactive'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleEdit(exercise)}
                            style={styles.editBtn}
                          >
                            <Ionicons name="create-outline" size={18} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDelete(exercise._id)}
                            style={styles.deleteBtn}
                          >
                            <Ionicons name="trash" size={18} color="#C9302C" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={styles.exerciseInstruction}>{exercise.instruction}</Text>
                      
                      {activeSubTab === 'receptive' && exercise.options && (
                        <View style={styles.optionsContainer}>
                          <Text style={styles.optionsTitle}>Options:</Text>
                          {exercise.options.map((opt) => (
                            <View key={opt.id} style={styles.optionRow}>
                              <Text style={styles.optionEmoji}>{opt.image}</Text>
                              <Text style={styles.optionText}>{opt.text}</Text>
                              {opt.correct && (
                                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {activeSubTab === 'expressive' && (
                        <View style={styles.exerciseDetails}>
                          {exercise.prompt && <Text style={styles.detailText}>Prompt: {exercise.prompt}</Text>}
                          {exercise.min_words && <Text style={styles.detailText}>Min Words: {exercise.min_words}</Text>}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderArticulationTab = () => {
    const sounds = ['s', 'r', 'l', 'k', 'th'];
    const soundNames = {
      s: 'S Sound',
      r: 'R Sound',
      l: 'L Sound',
      k: 'K Sound',
      th: 'TH Sound'
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.tabHeader}>
          <Text style={styles.tabTitle}>Articulation Exercise Management</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addButton} onPress={openAddArticulationModal}>
              <Ionicons name="add-circle" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.seedButton} onPress={handleSeedArticulation}>
              <Ionicons name="download" size={14} color="#FFF" />
              <Text style={styles.seedButtonText}>Seed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sound Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundSelector}>
          {sounds.map(sound => (
            <TouchableOpacity
              key={sound}
              style={[styles.soundTab, activeSound === sound && styles.soundTabActive]}
              onPress={() => setActiveSound(sound)}
            >
              <Text style={[styles.soundTabText, activeSound === sound && styles.soundTabTextActive]}>
                {soundNames[sound]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <ScrollView 
            style={styles.exercisesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {!articulationExercises[activeSound] ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={60} color="#CCC" />
                <Text style={styles.emptyText}>No exercises for {soundNames[activeSound]}</Text>
                <Text style={styles.emptySubtext}>Tap "Seed" to add exercises</Text>
              </View>
            ) : (
              Object.keys(articulationExercises[activeSound].levels || {}).sort((a, b) => Number(a) - Number(b)).map(level => (
                <View key={level} style={styles.levelSection}>
                  <View style={[styles.levelHeader, { backgroundColor: '#C9302C' }]}>
                    <Text style={styles.levelTitle}>
                      Level {level}: {articulationExercises[activeSound].levels[level].level_name}
                    </Text>
                    <Text style={styles.exerciseCount}>
                      {articulationExercises[activeSound].levels[level].exercises.length} exercises
                    </Text>
                  </View>
                  
                  {articulationExercises[activeSound].levels[level].exercises.map((exercise) => (
                    <View key={exercise._id} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseId}>{exercise.exercise_id}</Text>
                        </View>
                        <View style={styles.exerciseActions}>
                          <TouchableOpacity 
                            onPress={() => toggleArticulationActive(exercise._id)}
                            style={[styles.statusBadge, exercise.is_active ? styles.activeBadge : styles.inactiveBadge]}
                          >
                            <Text style={styles.statusText}>
                              {exercise.is_active ? 'Active' : 'Inactive'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => openEditArticulationModal(exercise)}
                            style={styles.editBtn}
                          >
                            <Ionicons name="create-outline" size={18} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => deleteArticulationExercise(exercise._id)}
                            style={styles.deleteBtn}
                          >
                            <Ionicons name="trash" size={18} color="#C9302C" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.detailText}>Target: {exercise.target}</Text>
                        <Text style={styles.detailText}>Order: {exercise.order}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="medical" size={22} color="#C9302C" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>CVAPed Therapist</Text>
            <Text style={styles.headerSubtitle}>Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#C9302C" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabNavigation}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name="home" 
            size={16} 
            color={activeTab === 'overview' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'articulation' && styles.tabButtonActive]}
          onPress={() => setActiveTab('articulation')}
        >
          <Ionicons 
            name="mic" 
            size={16} 
            color={activeTab === 'articulation' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'articulation' && styles.tabButtonTextActive]}>
            Articulation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'language' && styles.tabButtonActive]}
          onPress={() => setActiveTab('language')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={16} 
            color={activeTab === 'language' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'language' && styles.tabButtonTextActive]}>
            Language
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'fluency' && styles.tabButtonActive]}
          onPress={() => setActiveTab('fluency')}
        >
          <Ionicons 
            name="musical-notes" 
            size={16} 
            color={activeTab === 'fluency' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.tabButtonText, activeTab === 'fluency' && styles.tabButtonTextActive]}>
            Fluency
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'fluency' && renderFluencyTab()}
        {activeTab === 'language' && renderLanguageTab()}
        {activeTab === 'articulation' && renderArticulationTab()}
      </View>

      {/* Fluency Modal */}
      <Modal
        visible={showFluencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowFluencyModal(false);
          setEditingFluency(null);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFluency ? 'Edit Fluency Exercise' : 'Add Fluency Exercise'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowFluencyModal(false);
                setEditingFluency(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalFormScroll}
              contentContainerStyle={styles.modalFormContent}
            >
              <Text style={styles.label}>Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingFluency ? editingFluency.level : newFluency.level}
                  onValueChange={(value) => editingFluency 
                    ? setEditingFluency({...editingFluency, level: value})
                    : setNewFluency({...newFluency, level: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Level 1 - Breathing & Single Words" value={1} />
                  <Picker.Item label="Level 2 - Short Phrases" value={2} />
                  <Picker.Item label="Level 3 - Complete Sentences" value={3} />
                  <Picker.Item label="Level 4 - Reading Passages" value={4} />
                  <Picker.Item label="Level 5 - Spontaneous Speech" value={5} />
                </Picker>
              </View>

              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingFluency ? editingFluency.type : newFluency.type}
                  onValueChange={(value) => editingFluency 
                    ? setEditingFluency({...editingFluency, type: value})
                    : setNewFluency({...newFluency, type: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Controlled Breathing" value="controlled-breathing" />
                  <Picker.Item label="Short Phrase" value="short-phrase" />
                  <Picker.Item label="Sentence" value="sentence" />
                  <Picker.Item label="Passage" value="passage" />
                  <Picker.Item label="Spontaneous" value="spontaneous" />
                </Picker>
              </View>

              <Text style={styles.label}>Order (within level)</Text>
              <TextInput
                style={styles.input}
                value={String(editingFluency ? editingFluency.order : newFluency.order)}
                onChangeText={(text) => editingFluency 
                  ? setEditingFluency({...editingFluency, order: parseInt(text) || 1})
                  : setNewFluency({...newFluency, order: parseInt(text) || 1})
                }
                keyboardType="numeric"
                placeholder="1"
              />

              <Text style={styles.label}>Instruction</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingFluency ? editingFluency.instruction : newFluency.instruction}
                onChangeText={(text) => editingFluency 
                  ? setEditingFluency({...editingFluency, instruction: text})
                  : setNewFluency({...newFluency, instruction: text})
                }
                placeholder="Enter instructions..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Target</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingFluency ? editingFluency.target : newFluency.target}
                onChangeText={(text) => editingFluency 
                  ? setEditingFluency({...editingFluency, target: text})
                  : setNewFluency({...newFluency, target: text})
                }
                placeholder="e.g., Hello (for words) or complete sentence/passage"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Expected Duration (seconds)</Text>
              <TextInput
                style={styles.input}
                value={String(editingFluency ? editingFluency.expected_duration : newFluency.expected_duration)}
                onChangeText={(text) => editingFluency 
                  ? setEditingFluency({...editingFluency, expected_duration: parseInt(text) || 0})
                  : setNewFluency({...newFluency, expected_duration: parseInt(text) || 0})
                }
                keyboardType="numeric"
                placeholder="3"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Breathing Exercise</Text>
                <TouchableOpacity
                  onPress={() => editingFluency
                    ? setEditingFluency({...editingFluency, breathing: !editingFluency.breathing})
                    : setNewFluency({...newFluency, breathing: !newFluency.breathing})
                  }
                  style={[styles.switch, (editingFluency ? editingFluency.breathing : newFluency.breathing) && styles.switchActive]}
                >
                  <Text style={styles.switchText}>
                    {(editingFluency ? editingFluency.breathing : newFluency.breathing) ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <TouchableOpacity
                  onPress={() => editingFluency
                    ? setEditingFluency({...editingFluency, is_active: !editingFluency.is_active})
                    : setNewFluency({...newFluency, is_active: !newFluency.is_active})
                  }
                  style={[styles.switch, (editingFluency ? editingFluency.is_active : newFluency.is_active) && styles.switchActive]}
                >
                  <Text style={styles.switchText}>
                    {(editingFluency ? editingFluency.is_active : newFluency.is_active) ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowFluencyModal(false);
                  setEditingFluency(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={editingFluency ? handleUpdateFluency : handleCreateFluency}
              >
                <Text style={styles.saveButtonText}>
                  {editingFluency ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Language (Expressive) Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowLanguageModal(false);
          setEditingLanguage(null);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLanguage ? 'Edit Language Exercise' : 'Add Language Exercise'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowLanguageModal(false);
                setEditingLanguage(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalFormScroll}
              contentContainerStyle={styles.modalFormContent}
            >
              <Text style={styles.label}>Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingLanguage ? editingLanguage.level : newLanguage.level}
                  onValueChange={(value) => editingLanguage 
                    ? setEditingLanguage({...editingLanguage, level: value})
                    : setNewLanguage({...newLanguage, level: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Level 1 - Picture Description" value={1} />
                  <Picker.Item label="Level 2 - Sentence Formation" value={2} />
                  <Picker.Item label="Level 3 - Story Retell" value={3} />
                </Picker>
              </View>

              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingLanguage ? editingLanguage.type : newLanguage.type}
                  onValueChange={(value) => editingLanguage 
                    ? setEditingLanguage({...editingLanguage, type: value})
                    : setNewLanguage({...newLanguage, type: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Description" value="description" />
                  <Picker.Item label="Sentence" value="sentence" />
                  <Picker.Item label="Retell" value="retell" />
                </Picker>
              </View>

              <Text style={styles.label}>Order (within level)</Text>
              <TextInput
                style={styles.input}
                value={String(editingLanguage ? editingLanguage.order : newLanguage.order)}
                onChangeText={(text) => editingLanguage 
                  ? setEditingLanguage({...editingLanguage, order: parseInt(text) || 1})
                  : setNewLanguage({...newLanguage, order: parseInt(text) || 1})
                }
                keyboardType="numeric"
                placeholder="1"
              />

              <Text style={styles.label}>Instruction</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingLanguage ? editingLanguage.instruction : newLanguage.instruction}
                onChangeText={(text) => editingLanguage 
                  ? setEditingLanguage({...editingLanguage, instruction: text})
                  : setNewLanguage({...newLanguage, instruction: text})
                }
                placeholder="Enter instructions..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Prompt (emojis/text/words)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingLanguage ? editingLanguage.prompt : newLanguage.prompt}
                onChangeText={(text) => editingLanguage 
                  ? setEditingLanguage({...editingLanguage, prompt: text})
                  : setNewLanguage({...newLanguage, prompt: text})
                }
                placeholder="e.g., 🏠🌳👨‍👩‍👧 or Words: boy, ball, playing"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Expected Keywords (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={editingLanguage 
                  ? (Array.isArray(editingLanguage.expected_keywords) 
                    ? editingLanguage.expected_keywords.join(', ') 
                    : editingLanguage.expected_keywords)
                  : newLanguage.expected_keywords
                }
                onChangeText={(text) => editingLanguage 
                  ? setEditingLanguage({...editingLanguage, expected_keywords: text})
                  : setNewLanguage({...newLanguage, expected_keywords: text})
                }
                placeholder="e.g., house, tree, family, people"
              />

              <Text style={styles.label}>Minimum Words</Text>
              <TextInput
                style={styles.input}
                value={String(editingLanguage ? editingLanguage.min_words : newLanguage.min_words)}
                onChangeText={(text) => editingLanguage 
                  ? setEditingLanguage({...editingLanguage, min_words: parseInt(text) || 0})
                  : setNewLanguage({...newLanguage, min_words: parseInt(text) || 0})
                }
                keyboardType="numeric"
                placeholder="5"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <TouchableOpacity
                  onPress={() => editingLanguage
                    ? setEditingLanguage({...editingLanguage, is_active: !editingLanguage.is_active})
                    : setNewLanguage({...newLanguage, is_active: !newLanguage.is_active})
                  }
                  style={[styles.switch, (editingLanguage ? editingLanguage.is_active : newLanguage.is_active) && styles.switchActive]}
                >
                  <Text style={styles.switchText}>
                    {(editingLanguage ? editingLanguage.is_active : newLanguage.is_active) ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowLanguageModal(false);
                  setEditingLanguage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={editingLanguage ? handleUpdateLanguage : handleCreateLanguage}
              >
                <Text style={styles.saveButtonText}>
                  {editingLanguage ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Receptive Modal */}
      <Modal
        visible={showReceptiveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReceptiveModal(false);
          setEditingReceptive(null);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReceptive ? 'Edit Receptive Exercise' : 'Add Receptive Exercise'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowReceptiveModal(false);
                setEditingReceptive(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalFormScroll}
              contentContainerStyle={styles.modalFormContent}
            >
              <Text style={styles.label}>Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingReceptive ? editingReceptive.level : newReceptive.level}
                  onValueChange={(value) => editingReceptive 
                    ? setEditingReceptive({...editingReceptive, level: value})
                    : setNewReceptive({...newReceptive, level: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Level 1 - Vocabulary" value={1} />
                  <Picker.Item label="Level 2 - Directions" value={2} />
                  <Picker.Item label="Level 3 - Comprehension" value={3} />
                </Picker>
              </View>

              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingReceptive ? editingReceptive.type : newReceptive.type}
                  onValueChange={(value) => editingReceptive 
                    ? setEditingReceptive({...editingReceptive, type: value})
                    : setNewReceptive({...newReceptive, type: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Vocabulary" value="vocabulary" />
                  <Picker.Item label="Directions" value="directions" />
                  <Picker.Item label="Comprehension" value="comprehension" />
                </Picker>
              </View>

              <Text style={styles.label}>Order (within level)</Text>
              <TextInput
                style={styles.input}
                value={String(editingReceptive ? editingReceptive.order : newReceptive.order)}
                onChangeText={(text) => editingReceptive 
                  ? setEditingReceptive({...editingReceptive, order: parseInt(text) || 1})
                  : setNewReceptive({...newReceptive, order: parseInt(text) || 1})
                }
                keyboardType="numeric"
                placeholder="1"
              />

              <Text style={styles.label}>Target</Text>
              <TextInput
                style={styles.input}
                value={editingReceptive ? editingReceptive.target : newReceptive.target}
                onChangeText={(text) => editingReceptive 
                  ? setEditingReceptive({...editingReceptive, target: text})
                  : setNewReceptive({...newReceptive, target: text})
                }
                placeholder="e.g., apple, blue circle, sleeping"
              />

              <Text style={styles.label}>Instruction</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingReceptive ? editingReceptive.instruction : newReceptive.instruction}
                onChangeText={(text) => editingReceptive 
                  ? setEditingReceptive({...editingReceptive, instruction: text})
                  : setNewReceptive({...newReceptive, instruction: text})
                }
                placeholder="Enter instructions..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.sectionTitle}>Options (with emojis/icons)</Text>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={styles.optionRow}>
                  <View style={{flex: 2}}>
                    <Text style={styles.label}>Option {index + 1} Text</Text>
                    <TextInput
                      style={styles.input}
                      value={editingReceptive 
                        ? (editingReceptive.options[index]?.text || '') 
                        : (newReceptive.options[index]?.text || '')
                      }
                      onChangeText={(text) => {
                        const updatedOptions = editingReceptive 
                          ? [...editingReceptive.options]
                          : [...newReceptive.options];
                        updatedOptions[index] = {...updatedOptions[index], text};
                        if (editingReceptive) {
                          setEditingReceptive({...editingReceptive, options: updatedOptions});
                        } else {
                          setNewReceptive({...newReceptive, options: updatedOptions});
                        }
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.label}>Emoji/Icon</Text>
                    <TextInput
                      style={[styles.input, {fontSize: 20, textAlign: 'center'}]}
                      value={editingReceptive 
                        ? (editingReceptive.options[index]?.emoji || '') 
                        : (newReceptive.options[index]?.emoji || '')
                      }
                      onChangeText={(text) => {
                        const updatedOptions = editingReceptive 
                          ? [...editingReceptive.options]
                          : [...newReceptive.options];
                        updatedOptions[index] = {...updatedOptions[index], emoji: text};
                        if (editingReceptive) {
                          setEditingReceptive({...editingReceptive, options: updatedOptions});
                        } else {
                          setNewReceptive({...newReceptive, options: updatedOptions});
                        }
                      }}
                      placeholder="📖"
                    />
                  </View>
                </View>
              ))}

              <Text style={styles.label}>Correct Answer (1-4)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={(editingReceptive ? editingReceptive.correct_answer : newReceptive.correct_answer) + 1}
                  onValueChange={(value) => {
                    const index = value - 1;
                    if (editingReceptive) {
                      setEditingReceptive({...editingReceptive, correct_answer: index});
                    } else {
                      setNewReceptive({...newReceptive, correct_answer: index});
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Option 1" value={1} />
                  <Picker.Item label="Option 2" value={2} />
                  <Picker.Item label="Option 3" value={3} />
                  <Picker.Item label="Option 4" value={4} />
                </Picker>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <TouchableOpacity
                  onPress={() => editingReceptive
                    ? setEditingReceptive({...editingReceptive, is_active: !editingReceptive.is_active})
                    : setNewReceptive({...newReceptive, is_active: !newReceptive.is_active})
                  }
                  style={[styles.switch, (editingReceptive ? editingReceptive.is_active : newReceptive.is_active) && styles.switchActive]}
                >
                  <Text style={styles.switchText}>
                    {(editingReceptive ? editingReceptive.is_active : newReceptive.is_active) ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowReceptiveModal(false);
                  setEditingReceptive(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={editingReceptive ? handleUpdateReceptive : handleCreateReceptive}
              >
                <Text style={styles.saveButtonText}>
                  {editingReceptive ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Articulation Modal */}
      <Modal
        visible={showArticulationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowArticulationModal(false);
          setEditingArticulation(null);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingArticulation ? 'Edit Articulation Exercise' : 'Add Articulation Exercise'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowArticulationModal(false);
                setEditingArticulation(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalFormScroll}
              contentContainerStyle={styles.modalFormContent}
            >
              <Text style={styles.label}>Sound</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingArticulation ? editingArticulation.sound_id : newArticulation.sound_id}
                  onValueChange={(value) => editingArticulation 
                    ? setEditingArticulation({...editingArticulation, sound_id: value})
                    : setNewArticulation({...newArticulation, sound_id: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="S Sound" value="s" />
                  <Picker.Item label="R Sound" value="r" />
                  <Picker.Item label="L Sound" value="l" />
                  <Picker.Item label="K Sound" value="k" />
                  <Picker.Item label="TH Sound" value="th" />
                </Picker>
              </View>

              <Text style={styles.label}>Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editingArticulation ? editingArticulation.level : newArticulation.level}
                  onValueChange={(value) => editingArticulation 
                    ? setEditingArticulation({...editingArticulation, level: value})
                    : setNewArticulation({...newArticulation, level: value})
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Level 1 - Sound" value={1} />
                  <Picker.Item label="Level 2 - Syllable" value={2} />
                  <Picker.Item label="Level 3 - Word" value={3} />
                  <Picker.Item label="Level 4 - Phrase" value={4} />
                  <Picker.Item label="Level 5 - Sentence" value={5} />
                </Picker>
              </View>

              <Text style={styles.label}>Order (within level)</Text>
              <TextInput
                style={styles.input}
                value={String(editingArticulation ? editingArticulation.order : newArticulation.order)}
                onChangeText={(text) => editingArticulation 
                  ? setEditingArticulation({...editingArticulation, order: parseInt(text) || 1})
                  : setNewArticulation({...newArticulation, order: parseInt(text) || 1})
                }
                keyboardType="numeric"
                placeholder="1"
              />

              <Text style={styles.label}>Target</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingArticulation ? editingArticulation.target : newArticulation.target}
                onChangeText={(text) => editingArticulation 
                  ? setEditingArticulation({...editingArticulation, target: text})
                  : setNewArticulation({...newArticulation, target: text})
                }
                placeholder="Enter target sound/syllable/word/phrase/sentence..."
                multiline
                numberOfLines={2}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <TouchableOpacity
                  onPress={() => editingArticulation
                    ? setEditingArticulation({...editingArticulation, is_active: !editingArticulation.is_active})
                    : setNewArticulation({...newArticulation, is_active: !newArticulation.is_active})
                  }
                  style={[styles.switch, (editingArticulation ? editingArticulation.is_active : newArticulation.is_active) && styles.switchActive]}
                >
                  <Text style={styles.switchText}>
                    {(editingArticulation ? editingArticulation.is_active : newArticulation.is_active) ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowArticulationModal(false);
                  setEditingArticulation(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={editingArticulation ? handleUpdateArticulation : handleCreateArticulation}
              >
                <Text style={styles.saveButtonText}>
                  {editingArticulation ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  logoutButton: {
    padding: 8,
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxHeight: 50,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  tabButtonActive: {
    backgroundColor: '#C9302C',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 5,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  
  // Overview Styles
  overviewContainer: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#C9302C',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
  },
  welcomeName: {
    fontSize: 17,
    color: '#C9302C',
    marginTop: 4,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryList: {
    marginLeft: 8,
  },
  categoryItem: {
    fontSize: 13,
    color: '#555',
    marginVertical: 3,
    lineHeight: 20,
  },
  
  // Tab Content Styles
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9302C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  seedButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loader: {
    marginTop: 50,
  },
  exercisesList: {
    flex: 1,
    padding: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 6,
  },
  
  // Level Section Styles
  levelSection: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseCount: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
  },
  
  // Exercise Card Styles
  exerciseCard: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 8,
  },
  exerciseId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  exerciseType: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 3,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  inactiveBadge: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  exerciseInstruction: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 19,
  },
  exerciseDetails: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#C9302C',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  breathingBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  breathingText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: 'bold',
  },
  
  // Language Sub-tabs
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: '#C9302C',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  subTabTextActive: {
    color: '#C9302C',
    fontWeight: 'bold',
  },
  
  // Receptive Options
  optionsContainer: {
    marginTop: 10,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 6,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  
  // Articulation Sound Selector
  soundSelector: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 50,
  },
  soundTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTabActive: {
    backgroundColor: '#C9302C',
    borderColor: '#C9302C',
  },
  soundTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  soundTabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Header Buttons Container
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
    marginLeft: 6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: width * 0.95,
    height: height * 0.90,
    padding: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalForm: {
    flex: 1,
    paddingBottom: 10,
  },
  modalFormScroll: {
    flex: 1,
  },
  modalFormContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#2C3E50',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  switch: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    minWidth: 60,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#10B981',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#C9302C',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TherapistDashboard;
