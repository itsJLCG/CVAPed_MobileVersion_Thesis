import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TherapyScreen from './TherapyScreen';
import ProfileScreen from './ProfileScreen';
import BottomNav from './BottomNav';

const { width, height } = Dimensions.get('window');

const HomePage = ({ userData, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showTherapy, setShowTherapy] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const scrollViewRef = useRef(null);

  // Placeholder carousel data
  const carouselItems = [
    { id: 1, title: 'Welcome to CVACare', color: '#C9302C' },
    { id: 2, title: 'Book Appointments', color: '#6B9AC4' },
    { id: 3, title: 'Track Your Health', color: '#4CAF50' },
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
    setActiveTab(tab);
    console.log('Tab pressed:', tab);
    
    if (tab === 'therapy') {
      setShowTherapy(true);
      setShowProfile(false);
    } else if (tab === 'profile') {
      setShowProfile(true);
      setShowTherapy(false);
    } else {
      setShowTherapy(false);
      setShowProfile(false);
      // Navigate to different screens based on tab
    }
  };

  const handleTherapyBack = () => {
    setShowTherapy(false);
    setActiveTab('home');
  };

  const handleProfileBack = () => {
    setShowProfile(false);
    setActiveTab('home');
  };

  const handleNavigateFromTherapy = (destination) => {
    setShowTherapy(false);
    setActiveTab(destination);
    // Handle navigation to other screens
  };

  const handleTherapyCardPress = () => {
    setActiveTab('therapy');
    setShowTherapy(true);
    setShowProfile(false);
  };

  // Show Profile screen if profile tab is active
  if (showProfile) {
    return (
      <ProfileScreen 
        userData={userData} 
        onBack={handleProfileBack}
        onLogout={onLogout}
      />
    );
  }

  // Show Therapy screen if therapy tab is active
  if (showTherapy) {
    return <TherapyScreen onBack={handleTherapyBack} onNavigate={handleNavigateFromTherapy} />;
  }

  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.carouselText}>{item.title}</Text>
                <Text style={styles.carouselSubtext}>Slide {item.id} of {carouselItems.length}</Text>
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

        {/* Additional Content Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="calendar" size={32} color="#C9302C" />
              <Text style={styles.quickActionText}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="medical" size={32} color="#C9302C" />
              <Text style={styles.quickActionText}>Medical Records</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleTherapyCardPress}
            >
              <Ionicons name="fitness" size={32} color="#C9302C" />
              <Text style={styles.quickActionText}>Therapy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="heart" size={32} color="#C9302C" />
              <Text style={styles.quickActionText}>Health</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>No recent activity</Text>
            <Text style={styles.activitySubtext}>Your recent activities will appear here</Text>
          </View>
        </View>

        {/* Bottom spacing for navbar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    height: 200,
  },
  carouselItem: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  carouselText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  carouselSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Activity Styles
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#999',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 80,
  },
});

export default HomePage;
