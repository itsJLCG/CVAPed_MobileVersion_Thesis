import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ArticulationExerciseScreen from './ArticulationExerciseScreen';

const { width } = Dimensions.get('window');

const ArticulationTherapyScreen = ({ onBack }) => {
  const [selectedSound, setSelectedSound] = useState(null);

  const handleBeginAssessment = (soundId) => {
    setSelectedSound(soundId);
  };

  const handleBackFromExercise = () => {
    setSelectedSound(null);
  };

  // Show exercise screen if sound is selected
  if (selectedSound) {
    return (
      <ArticulationExerciseScreen
        route={{ params: { soundId: selectedSound } }}
        navigation={{ goBack: handleBackFromExercise }}
      />
    );
  }

  const soundPrograms = [
    {
      id: 1,
      soundId: 's',
      symbol: '/s/',
      title: 'S Sound',
      description: 'Systematic practice for voiceless alveolar fricative production in initial, medial, and final positions',
      color: '#C9302C',
      targetExamples: ['sun', 'sock', 'sip'],
      stages: '5 Progressive Stages',
    },
    {
      id: 2,
      soundId: 'r',
      symbol: '/r/',
      title: 'R Sound',
      description: 'Structured intervention for retroflex approximant articulation across contextual complexity levels',
      color: '#4A90E2',
      targetExamples: ['rabbit', 'red', 'run'],
      stages: '5 Progressive Stages',
    },
    {
      id: 3,
      soundId: 'l',
      symbol: '/l/',
      title: 'L Sound',
      description: 'Progressive training for lateral approximant sound production in varied linguistic contexts',
      color: '#F4A460',
      targetExamples: ['lion', 'leaf', 'lamp'],
      stages: '5 Progressive Stages',
    },
    {
      id: 4,
      soundId: 'k',
      symbol: '/k/',
      title: 'K Sound',
      description: 'Hierarchical practice for voiceless velar plosive articulation with increasing phonetic complexity',
      color: '#9B59B6',
      targetExamples: ['kite', 'cat', 'car'],
      stages: '5 Progressive Stages',
    },
    {
      id: 5,
      soundId: 'th',
      symbol: '/th/',
      title: 'TH Sound',
      description: 'Sequential exercises for interdental fricative production in single words through connected speech',
      color: '#27AE60',
      targetExamples: ['think', 'this', 'thumb'],
      stages: '5 Progressive Stages',
    },
  ];
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articulation Therapy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Articulation Therapy Program</Text>
          <Text style={styles.programSubtitle}>EVIDENCE-BASED SPEECH SOUND INTERVENTION</Text>
          <Text style={styles.description}>
            Select a target phoneme for systematic intervention. Each program includes five hierarchical levels progressing from isolated sound production through connected speech contexts.
          </Text>
        </View>

        {/* Sound Programs Grid */}
        <View style={styles.programsGrid}>
          {soundPrograms.map((program) => (
            <View key={program.id} style={styles.programCard}>
              {/* Sound Symbol Badge */}
              <View style={styles.symbolBadgeContainer}>
                <View style={[styles.symbolBadge, { borderColor: program.color }]}>
                  <Text style={[styles.symbolText, { color: program.color }]}>
                    {program.symbol}
                  </Text>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.soundTitle}>{program.title}</Text>
                <Text style={styles.soundDescription}>{program.description}</Text>

                {/* Target Examples */}
                <View style={styles.examplesSection}>
                  <Text style={styles.sectionLabel}>TARGET EXAMPLES</Text>
                  <View style={styles.examplesRow}>
                    {program.targetExamples.map((example, index) => (
                      <View key={index} style={styles.exampleBadge}>
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Intervention Levels */}
                <View style={styles.levelsSection}>
                  <Text style={styles.sectionLabel}>INTERVENTION LEVELS</Text>
                  <Text style={styles.stagesText}>{program.stages}</Text>
                </View>

                {/* Begin Assessment Button */}
                <TouchableOpacity 
                  style={[styles.assessmentButton, { backgroundColor: program.color }]}
                  activeOpacity={0.8}
                  onPress={() => handleBeginAssessment(program.soundId)}
                >
                  <Text style={styles.assessmentButtonText}>BEGIN ASSESSMENT</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Styles
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

  // Content Styles
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderLeftWidth: 4,
    borderLeftColor: '#C9302C',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  programSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7F8C8D',
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    textAlign: 'center',
  },

  // Programs Grid
  programsGrid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },

  // Program Card
  programCard: {
    width: width - 60,
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },

  // Symbol Badge
  symbolBadgeContainer: {
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 15,
  },
  symbolBadge: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Card Content
  cardContent: {
    padding: 20,
    paddingTop: 10,
  },
  soundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'left',
  },
  soundDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'left',
  },

  // Examples Section
  examplesSection: {
    marginBottom: 18,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7F8C8D',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  exampleText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },

  // Levels Section
  levelsSection: {
    marginBottom: 20,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 12,
  },
  stagesText: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '600',
  },

  // Assessment Button
  assessmentButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  assessmentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default ArticulationTherapyScreen;
