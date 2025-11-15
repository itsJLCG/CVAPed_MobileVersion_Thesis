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
import ReceptiveLanguageScreen from './ReceptiveLanguageScreen';
import ExpressiveLanguageScreen from './ExpressiveLanguageScreen';

const { width } = Dimensions.get('window');

const LanguageTherapyScreen = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState('selection'); // 'selection', 'receptive', 'expressive'
  const [triggerReload, setTriggerReload] = useState(0);

  const handleBackToSelection = () => {
    setCurrentScreen('selection');
  };

  const handleNavigateToReceptive = () => {
    setCurrentScreen('receptive');
    setTriggerReload(prev => prev + 1); // Trigger reload when returning
  };

  const handleNavigateToExpressive = () => {
    setCurrentScreen('expressive');
    setTriggerReload(prev => prev + 1); // Trigger reload when returning
  };

  if (currentScreen === 'receptive') {
    return <ReceptiveLanguageScreen onBack={handleBackToSelection} reloadTrigger={triggerReload} />;
  }

  if (currentScreen === 'expressive') {
    return <ExpressiveLanguageScreen onBack={handleBackToSelection} reloadTrigger={triggerReload} />;
  }
  const therapyAreas = [
    {
      id: 1,
      icon: '💬',
      title: 'Receptive Language',
      subtitle: 'Understanding & Comprehension',
      color: '#4A90E2',
      skills: [
        'Listening Comprehension',
        'Following Directions',
        'Vocabulary Recognition',
        'Sentence Understanding',
      ],
    },
    {
      id: 2,
      icon: '💬',
      title: 'Expressive Language',
      subtitle: 'Communication & Expression',
      color: '#9B59B6',
      skills: [
        'Picture Description',
        'Sentence Formation',
        'Story Retelling',
        'Verbal Expression',
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
        <Text style={styles.headerTitle}>Language Therapy</Text>
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
          <Text style={styles.mainTitle}>Language Therapy Assessment</Text>
          <Text style={styles.subtitle}>Choose your therapy focus area</Text>
        </View>

        {/* Therapy Areas */}
        <View style={styles.areasContainer}>
          {therapyAreas.map((area) => (
            <View key={area.id} style={styles.areaCard}>
              {/* Icon Badge */}
              <View style={styles.iconBadgeContainer}>
                <View style={[styles.iconBadge, { backgroundColor: area.color }]}>
                  <Text style={styles.iconText}>{area.icon}</Text>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.areaTitle}>{area.title}</Text>
                <Text style={[styles.areaSubtitle, { color: area.color }]}>
                  {area.subtitle}
                </Text>

                {/* Skills List */}
                <View style={styles.skillsList}>
                  {area.skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                {/* Start Button */}
                <TouchableOpacity 
                  style={[styles.exerciseButton, { backgroundColor: area.color }]}
                  activeOpacity={0.8}
                  onPress={() => area.id === 1 ? handleNavigateToReceptive() : handleNavigateToExpressive()}
                >
                  <Text style={styles.exerciseButtonText}>START THERAPY</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
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
    borderLeftColor: '#4A90E2',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },

  // Areas Container
  areasContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },

  // Area Card
  areaCard: {
    width: width - 60,
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Icon Badge
  iconBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },

  // Card Content
  cardContent: {
    alignItems: 'center',
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  areaSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },

  // Skills List
  skillsList: {
    width: '100%',
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
  },
  checkmark: {
    fontSize: 16,
    color: '#27AE60',
    marginRight: 12,
    fontWeight: 'bold',
  },
  skillText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },

  // Exercise Button
  exerciseButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  exerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default LanguageTherapyScreen;
