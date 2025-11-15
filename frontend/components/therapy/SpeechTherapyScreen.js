import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ArticulationTherapyScreen from './speech/ArticulationTherapyScreen';
import LanguageTherapyScreen from './speech/LanguageTherapyScreen';
import FluencyTherapyScreen from './speech/FluencyTherapyScreen';

const { width } = Dimensions.get('window');

const SpeechTherapyScreen = ({ onBack }) => {
  console.log('SpeechTherapyScreen rendered');
  
  const [selectedTherapy, setSelectedTherapy] = useState(null);

  const handleBeginAssessment = (therapyType) => {
    setSelectedTherapy(therapyType);
  };

  const handleBackFromTherapy = () => {
    setSelectedTherapy(null);
  };

  // Show specific therapy screen if selected
  if (selectedTherapy === 'articulation') {
    return <ArticulationTherapyScreen onBack={handleBackFromTherapy} />;
  }
  if (selectedTherapy === 'language') {
    return <LanguageTherapyScreen onBack={handleBackFromTherapy} />;
  }
  if (selectedTherapy === 'fluency') {
    return <FluencyTherapyScreen onBack={handleBackFromTherapy} />;
  }

  const therapyTypes = [
    {
      id: 1,
      letter: 'A',
      title: 'Articulation Therapy',
      subtitle: 'SOUND PRODUCTION & PRONUNCIATION',
      description: 'Clinical speech sound therapy focused on improving articulation accuracy and phonological development through systematic assessment and intervention.',
      color: '#C9302C',
      type: 'articulation',
      features: [
        'Standardized pronunciation assessments',
        'Multi-trial recording and evaluation system',
        'Consonant and vowel pronunciation scoring metrics',
        'Real-time accuracy feedback sessions',
        'Comprehensive progress monitoring',
        'Professional therapist review interface',
      ],
    },
    {
      id: 2,
      letter: 'L',
      title: 'Language Therapy',
      subtitle: 'RECEPTIVE & EXPRESSIVE LANGUAGE',
      description: 'Comprehensive language intervention program designed to support receptive development, comprehension skills, and expressive language use through structured therapeutic activities.',
      color: '#4A90E2',
      type: 'language',
      features: [
        'Receptive language assessment tasks',
        'Expressive language evaluation protocols',
        'Grammar and syntax development exercises',
        'Quantitative response analysis',
        'Semantic and syntactic scoring system',
        'Age-appropriate intervention progression',
      ],
    },
    {
      id: 3,
      letter: 'F',
      title: 'Fluency Therapy',
      subtitle: 'FLUENCY DISORDERS & SPEECH RATE CONTROL',
      description: 'Evidence-based fluency intervention program designed to address stuttering behaviors, improve speech flow through systematic desensitization and fluency-shaping techniques.',
      color: '#F4A460',
      type: 'fluency',
      features: [
        'Structured reading and speaking tasks',
        'Quantitative speech rate analysis (WPM)',
        'Dysfluency pattern identification',
        'Real-time biofeedback visualization',
        'Fluency enhancement metrics',
        'Systematic progress documentation',
      ],
    },
  ];
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speech Therapy</Text>
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
          <Text style={styles.mainTitle}>Speech Therapy Types</Text>
          <Text style={styles.subtitle}>Choose the type of speech therapy you need</Text>
        </View>

        {/* Therapy Cards - Three Column Grid */}
        <View style={styles.cardsContainer}>
          {therapyTypes.map((therapy) => (
            <View key={therapy.id} style={styles.therapyCard}>
              {/* Letter Badge */}
              <View style={styles.letterBadgeContainer}>
                <View style={[styles.letterBadge, { borderColor: therapy.color }]}>
                  <Text style={[styles.letterText, { color: therapy.color }]}>
                    {therapy.letter}
                  </Text>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopContent}>
                  <Text style={styles.cardTitle}>{therapy.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: therapy.color }]}>
                    {therapy.subtitle}
                  </Text>
                  
                  <Text style={styles.cardDescription}>{therapy.description}</Text>

                  {/* Program Features */}
                  <Text style={styles.featuresTitle}>KEY FEATURES:</Text>
                  <View style={styles.featuresList}>
                    {therapy.features.slice(0, 3).map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={14} color={therapy.color} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Begin Assessment Button */}
                <TouchableOpacity 
                  style={[styles.assessmentButton, { backgroundColor: therapy.color }]}
                  onPress={() => handleBeginAssessment(therapy.type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.assessmentButtonText}>BEGIN</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    width: 34, // Same width as back button for centering
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
  },

  // Cards Container - Three Column Grid
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 20,
    gap: 6,
  },

  // Therapy Card
  therapyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 660,
    maxHeight: 660,
  },

  // Letter Badge
  letterBadgeContainer: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  letterBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  // Card Content
  cardContent: {
    flex: 1,
    padding: 10,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  cardTopContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 10,
    color: '#555',
    lineHeight: 15,
    marginBottom: 12,
    textAlign: 'justify',
  },

  // Features
  featuresTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  featuresList: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  featureText: {
    flex: 1,
    fontSize: 9,
    color: '#555',
    lineHeight: 14,
    textAlign: 'justify',
  },

  // Assessment Button
  assessmentButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  assessmentButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default SpeechTherapyScreen;
