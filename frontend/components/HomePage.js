import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TherapyScreen from './TherapyScreen';
import ProfileScreen from './ProfileScreen';
import HealthScreen from './HealthScreen';
import BottomNav from './BottomNav';

const { width, height } = Dimensions.get('window');

const HomePage = ({ userData, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'therapy', 'profile', 'health'
  const scrollViewRef = useRef(null);

  // Carousel data explaining the system
  const carouselItems = [
    { 
      id: 1, 
      title: 'Welcome to CVAPed', 
      subtitle: 'Cerebrovascular Accident Pediatric Education',
      description: 'Your comprehensive stroke rehabilitation companion',
      color: '#C9302C',
      icon: 'heart-circle'
    },
    { 
      id: 2, 
      title: 'Speech Therapy', 
      subtitle: 'Professional Rehabilitation',
      description: 'Articulation, fluency, and language exercises',
      color: '#6B9AC4',
      icon: 'chatbubbles'
    },
    { 
      id: 3, 
      title: 'Track Progress', 
      subtitle: 'Monitor Your Journey',
      description: 'View detailed health logs and therapy analytics',
      color: '#4CAF50',
      icon: 'analytics'
    },
  ];

  const handleSearch = () => {
    console.log('Search query:', searchQuery);
    // Implement search functionality later
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
    // Navigate to profile screen
  };

  const handleTabPress = (tab) => {
    console.log('Tab pressed:', tab);
    setActiveTab(tab);
    setCurrentScreen(tab); // Single atomic state update
    console.log('✅ Navigating to', tab, 'screen');
  };

  const handleTherapyBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleProfileBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleHealthBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleNavigateFromTherapy = (destination) => {
    console.log('Navigating from therapy to:', destination);
    setActiveTab(destination);
    setCurrentScreen(destination);
  };

  const handleTherapyCardPress = () => {
    setActiveTab('therapy');
    setCurrentScreen('therapy');
  };

  const handleHealthCardPress = () => {
    setActiveTab('health');
    setCurrentScreen('health');
  };

  // Show Profile screen if profile tab is active
  if (currentScreen === 'profile') {
    return (
      <View style={styles.container}>
        <ProfileScreen 
          userData={userData} 
          onBack={handleProfileBack}
          onLogout={onLogout}
        />
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // Show Health screen if health tab is active
  if (currentScreen === 'health') {
    console.log('🏥 Rendering HealthScreen component');
    return (
      <View style={styles.container}>
        <HealthScreen onBack={handleHealthBack} />
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // Show Therapy screen if therapy tab is active
  if (currentScreen === 'therapy') {
    return <TherapyScreen onBack={handleTherapyBack} onNavigate={handleNavigateFromTherapy} />;
  }

  return (
    <View style={styles.container}>
      {/* Upper Navbar */}
      <View style={styles.topNavbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.userIconContainer} onPress={handleProfilePress}>
          <Ionicons name="person-circle" size={40} color="#C9302C" />
        </TouchableOpacity>
      </View>

      {/* Main Content with Carousel */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Section */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {carouselItems.map((item) => (
              <View 
                key={item.id} 
                style={[styles.carouselItem, { backgroundColor: item.color }]}
              >
                <Ionicons name={item.icon} size={60} color="#FFFFFF" style={styles.carouselIcon} />
                <Text style={styles.carouselText}>{item.title}</Text>
                <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Carousel Indicators */}
          <View style={styles.indicatorContainer}>
            {carouselItems.map((_, index) => (
              <View key={index} style={styles.indicator} />
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <View style={styles.aboutHeader}>
            <Ionicons name="information-circle" size={28} color="#C9302C" />
            <Text style={styles.aboutTitle}>About CVAPed</Text>
          </View>
          <Text style={styles.aboutText}>
            CVAPed is a mobile-based rehabilitation system designed specifically for pediatric stroke patients. 
            Our comprehensive platform combines speech therapy exercises, health monitoring, and progress tracking 
            to support your recovery journey.
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Interactive Speech Therapy Exercises</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Real-time Progress Monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Comprehensive Health Logs</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Personalized Rehabilitation Plans</Text>
            </View>
          </View>
        </View>

        {/* Additional Content Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Therapy Modules</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.articulationCard]}
              onPress={handleTherapyCardPress}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: '#FF6B6B' }]}>
                <Ionicons name="mic" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Articulation</Text>
              <Text style={styles.quickActionSubtext}>Sound production therapy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.fluencyCard]}
              onPress={handleTherapyCardPress}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: '#4ECDC4' }]}>
                <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Fluency</Text>
              <Text style={styles.quickActionSubtext}>Speech flow exercises</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.receptiveCard]}
              onPress={handleTherapyCardPress}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: '#95E1D3' }]}>
                <Ionicons name="ear" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Receptive</Text>
              <Text style={styles.quickActionSubtext}>Language comprehension</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.expressiveCard]}
              onPress={handleTherapyCardPress}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: '#F38181' }]}>
                <Ionicons name="chatbox" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Expressive</Text>
              <Text style={styles.quickActionSubtext}>Language expression</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Monitoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Progress</Text>
          <TouchableOpacity 
            style={styles.healthCard}
            onPress={handleHealthCardPress}
          >
            <View style={styles.healthCardLeft}>
              <View style={styles.healthIconContainer}>
                <Ionicons name="heart" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.healthInfo}>
                <Text style={styles.healthCardTitle}>View Health Logs</Text>
                <Text style={styles.healthCardSubtext}>Track your therapy progress and achievements</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#C9302C" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.activityCard}>
            <Ionicons name="rocket" size={48} color="#C9302C" style={styles.activityIcon} />
            <Text style={styles.activityText}>Ready to begin your journey?</Text>
            <Text style={styles.activitySubtext}>
              Start with therapy exercises or check your health logs to track your progress
            </Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={handleTherapyCardPress}
            >
              <Text style={styles.startButtonText}>Start Therapy</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for navbar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Top Navbar Styles
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  userIconContainer: {
    padding: 5,
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Carousel Styles
  carouselContainer: {
    marginBottom: 20,
  },
  carousel: {
    height: 280,
  },
  carouselItem: {
    width: width,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  carouselIcon: {
    marginBottom: 15,
    opacity: 0.9,
  },
  carouselText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  carouselSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 8,
    textAlign: 'center',
  },
  carouselDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },

  // About Section Styles
  aboutSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  aboutText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },

  // Section Styles
  section: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },

  // Quick Actions Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 45) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  articulationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  fluencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  receptiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#95E1D3',
  },
  expressiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F38181',
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },

  // Health Card Styles
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#C9302C',
  },
  healthCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  healthIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  healthInfo: {
    flex: 1,
  },
  healthCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  healthCardSubtext: {
    fontSize: 13,
    color: '#666',
  },

  // Activity Styles
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIcon: {
    marginBottom: 15,
  },
  activityText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  activitySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9302C',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 80,
  },
});

export default HomePage;
