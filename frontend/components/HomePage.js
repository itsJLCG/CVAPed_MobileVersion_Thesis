import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { successStoryAPI } from '../services/api';
import TherapyScreen from './TherapyScreen';
import ProfileScreen from './ProfileScreen';
import HealthScreen from './HealthScreen';
import PredictionsScreen from './PredictionsScreen';
import PrescriptiveScreen from './PrescriptiveScreen';
import AppointmentsScreen from './AppointmentsScreen';
import SuccessStoryDetailScreen from './SuccessStoryDetailScreen';
import BottomNav from './BottomNav';

const { width, height } = Dimensions.get('window');

const HomePage = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'therapy', 'profile', 'health', 'story-detail'
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [successStories, setSuccessStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Trigger animations on mount
  useEffect(() => {
    loadSuccessStories();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger card animations
    Animated.stagger(100, [
      Animated.spring(card1Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card3Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for call-to-action
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load success stories
  const loadSuccessStories = async () => {
    try {
      setLoadingStories(true);
      const response = await successStoryAPI.getAll();
      if (response.success) {
        setSuccessStories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading success stories:', error);
      setSuccessStories([]);
    } finally {
      setLoadingStories(false);
    }
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

  const handlePredictionsBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handlePrescriptiveBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleAppointmentsBack = () => {
    setCurrentScreen('home');
    setActiveTab('home');
  };

  const handleAppointmentsPress = () => {
    setCurrentScreen('schedule');
    setActiveTab('schedule');
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

  // Handle manual scroll for carousel
  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setActiveSlide(index);
  };

  const handleStoryPress = (story) => {
    setSelectedStory(story);
    setCurrentScreen('story-detail');
  };

  const handleStoryDetailBack = () => {
    setSelectedStory(null);
    setCurrentScreen('home');
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

  // Show Predictions screen if predictions tab is active
  if (currentScreen === 'predictions') {
    return (
      <View style={styles.container}>
        <PredictionsScreen onBack={handlePredictionsBack} />
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // Show Prescriptive screen if prescriptive tab is active
  if (currentScreen === 'prescriptive') {
    return (
      <View style={styles.container}>
        <PrescriptiveScreen onBack={handlePrescriptiveBack} />
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // Show Appointments screen if appointments tab is active
  if (currentScreen === 'schedule') {
    return (
      <View style={styles.container}>
        <AppointmentsScreen onBack={handleAppointmentsBack} />
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  // Show Therapy screen if therapy tab is active
  if (currentScreen === 'therapy') {
    return <TherapyScreen onBack={handleTherapyBack} onNavigate={handleNavigateFromTherapy} />;
  }

  // Show Success Story Detail screen
  if (currentScreen === 'story-detail') {
    return <SuccessStoryDetailScreen story={selectedStory} onBack={handleStoryDetailBack} />;
  }

  const firstName = userData?.firstName || 'Friend';
  const featuredStories = successStories.slice(0, 3);
  const therapyPrograms = [
    {
      key: 'articulation',
      title: 'Articulation',
      subtitle: 'Build clear sounds through guided speech practice.',
      accent: '#e85d5d',
      icon: 'mic',
      badge: 'PEDIATRIC',
      duration: '15-20 min'
    },
    {
      key: 'language',
      title: 'Language',
      subtitle: 'Strengthen comprehension and expressive communication.',
      accent: '#1ea896',
      icon: 'chatbubbles',
      badge: 'PEDIATRIC',
      duration: '10-15 min'
    },
    {
      key: 'physical',
      title: 'Physical',
      subtitle: 'Support gait recovery and steady movement practice.',
      accent: '#2f6fed',
      icon: 'walk',
      badge: 'STROKE',
      duration: '20-25 min'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topNavbar}>
          <Animated.View 
            style={[
              styles.navContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.heroShell}>
              <View style={styles.heroGlowLarge} />
              <View style={styles.heroGlowSmall} />
              <View style={styles.heroTextColumn}>
                <View style={styles.heroEyebrowRow}>
                  <Text style={styles.heroEyebrow}>Daily recovery space</Text>
                  <View style={styles.heroStatusPill}>
                    <Ionicons name="sparkles" size={11} color="#fff7ed" />
                    <Text style={styles.heroStatusText}>Care plan ready</Text>
                  </View>
                </View>
                <Text style={styles.heroTitle}>Welcome back, {firstName}</Text>
                <Text style={styles.heroSubtitle}>
                  Continue therapy, check your care tools, and stay inspired by patient success stories.
                </Text>

                <View style={styles.heroInsightCard}>
                  <View style={styles.heroInsightIconWrap}>
                    <Ionicons name="pulse" size={16} color="#a61e22" />
                  </View>
                  <View style={styles.heroInsightTextWrap}>
                    <Text style={styles.heroInsightTitle}>A short session today keeps momentum strong</Text>
                    <Text style={styles.heroInsightText}>Open therapy or review your appointments in one tap.</Text>
                  </View>
                </View>

                <View style={styles.heroActionRow}>
                  <TouchableOpacity style={styles.heroPrimaryButton} onPress={handleTherapyCardPress} activeOpacity={0.85}>
                    <Text style={styles.heroPrimaryButtonText}>Start Therapy</Text>
                    <Ionicons name="arrow-forward" size={16} color="#a61e22" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.heroGhostButton} onPress={handleAppointmentsPress} activeOpacity={0.85}>
                    <Ionicons name="calendar-clear" size={15} color="#FFFFFF" />
                    <Text style={styles.heroGhostButtonText}>Appointments</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatValue}>4</Text>
                    <Text style={styles.heroStatLabel}>Programs</Text>
                  </View>
                  <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatValue}>{successStories.length}</Text>
                    <Text style={styles.heroStatLabel}>Stories</Text>
                  </View>
                  <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatValue}>24/7</Text>
                    <Text style={styles.heroStatLabel}>Access</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroBrandCard}>
                <View style={styles.heroBrandBadge}>
                  <Text style={styles.heroBrandBadgeText}>CVAPed</Text>
                </View>
                <View style={styles.logoIconWrapper}>
                  <Image 
                    source={require('../assets/cvalogonotext.png')} 
                    style={styles.logoIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.logoTextWrapper}>
                  <Image 
                    source={require('../assets/CVAPed_Text.png')} 
                    style={styles.logoText}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.heroBrandCaption}>Personalized therapy support for every recovery step.</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.section}> 
          <View style={styles.quickAccessPanel}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <Text style={styles.sectionCaption}>Everything you need for today's care plan.</Text>
              </View>
              <View style={styles.panelBadge}>
                <Ionicons name="flash" size={12} color="#b45309" />
                <Text style={styles.panelBadgeText}>Ready</Text>
              </View>
            </View>

            <View style={styles.quickAccessRow}>
              <TouchableOpacity style={styles.quickAccessCard} onPress={handleAppointmentsPress} activeOpacity={0.85}>
                <View style={[styles.quickAccessIconWrap, { backgroundColor: '#ffe7d6' }]}>
                  <Ionicons name="calendar" size={20} color="#c2410c" />
                </View>
                <Text style={styles.quickAccessTitle}>Appointments</Text>
                <Text style={styles.quickAccessText}>Manage your upcoming sessions.</Text>
                <Text style={styles.quickAccessLink}>Open planner</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAccessCard} onPress={handleHealthCardPress} activeOpacity={0.85}>
                <View style={[styles.quickAccessIconWrap, { backgroundColor: '#dff7f3' }]}>
                  <Ionicons name="pulse" size={20} color="#0f766e" />
                </View>
                <Text style={styles.quickAccessTitle}>Health Dashboard</Text>
                <Text style={styles.quickAccessText}>Review progress and therapy logs.</Text>
                <Text style={styles.quickAccessLink}>See progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Therapy Programs</Text>
              <Text style={styles.sectionCaption}>Choose a guided activity that matches today's goal.</Text>
            </View>
            <TouchableOpacity onPress={handleTherapyCardPress} activeOpacity={0.8}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {therapyPrograms.map((program, index) => {
              const animStyle = index === 0 ? card1Anim : index === 1 ? card2Anim : card3Anim;
              return (
                <Animated.View key={program.key} style={{ opacity: animStyle, transform: [{ scale: animStyle }], width: index === 2 ? '100%' : '48%' }}>
                  <TouchableOpacity 
                    style={[styles.quickActionCard, index === 2 && styles.quickActionCardWide]}
                    onPress={handleTherapyCardPress}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.cardGradient, { backgroundColor: program.accent }]}> 
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{program.badge}</Text>
                      </View>
                      <View style={styles.cardIconContainer}>
                        <Ionicons name={program.icon} size={32} color="#FFFFFF" />
                      </View>
                      <Text style={styles.quickActionText}>{program.title}</Text>
                      <Text style={styles.quickActionSubtext}>{program.subtitle}</Text>
                      <View style={styles.cardFooter}>
                        <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.cardFooterText}>{program.duration}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Stories of Progress</Text>
              <Text style={styles.sectionCaption}>See how recovery grows one step at a time.</Text>
            </View>
            <View style={styles.storyCountChip}>
              <Text style={styles.storyCountChipText}>{featuredStories.length || 0} featured</Text>
            </View>
          </View>

          {loadingStories ? (
            <View style={styles.storyLoadingCard}>
              <Ionicons name="sparkles" size={24} color="#C9302C" />
              <Text style={styles.storyLoadingText}>Loading success stories...</Text>
            </View>
          ) : featuredStories.length > 0 ? (
            <View style={styles.storyCarouselShell}>
              <View style={styles.storyCarouselFrame}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {featuredStories.map((story) => (
                  <View key={`story-${story._id || story.id}`} style={styles.storyCarouselSlide}>
                    <TouchableOpacity
                      style={styles.storySpotlightCard}
                      onPress={() => handleStoryPress(story)}
                      activeOpacity={0.9}
                    >
                      {story.images && story.images.length > 0 ? (
                        <Image
                          source={{ uri: story.images[0] }}
                          style={styles.storySpotlightImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.storySpotlightFallback}>
                          <Ionicons name="image-outline" size={34} color="#94a3b8" />
                        </View>
                      )}

                      <View style={styles.storySpotlightOverlay}>
                        <View style={styles.storySpotlightBadge}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                          <Text style={styles.storySpotlightBadgeText}>Success Story</Text>
                        </View>
                        <Text style={styles.storySpotlightName}>{story.patientName || 'Patient Story'}</Text>
                        <Text style={styles.storySpotlightExcerpt} numberOfLines={3}>
                          {story.story || 'Tap to read this recovery journey and celebrate the progress made.'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              </View>
            </View>
          ) : (
            <View style={styles.storyEmptyCard}>
              <Ionicons name="happy-outline" size={32} color="#C9302C" />
              <Text style={styles.storyEmptyTitle}>Success stories will appear here</Text>
              <Text style={styles.storyEmptyText}>As patients share their progress, you'll be able to browse them from home.</Text>
            </View>
          )}

          {featuredStories.length > 1 && (
            <View style={styles.storyIndicatorRow}>
              {featuredStories.map((story, index) => (
                <View
                  key={`indicator-${story._id || story.id || index}`}
                  style={[styles.storyIndicator, index === activeSlide && styles.storyIndicatorActive]}
                />
              ))}
            </View>
          )}
        </View>

        <Animated.View 
          style={[
            styles.section,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.ctaCard}>
            <Text style={styles.ctaEyebrow}>Today's focus</Text>
            <Text style={styles.ctaTitle}>Keep your recovery momentum going</Text>
            <Text style={styles.ctaSubtext}>
              A short daily session helps strengthen skills, build consistency, and make your next milestone feel closer.
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleTherapyCardPress}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaButtonText}>Begin Therapy</Text>
              <Ionicons name="arrow-forward-circle" size={22} color="#a61e22" />
            </TouchableOpacity>
            <View style={styles.ctaStats}>
              <View style={styles.ctaStatItem}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.ctaStatText}>Personalized</Text>
              </View>
              <View style={styles.ctaStatItem}>
                <Ionicons name="trending-up" size={18} color="#FFFFFF" />
                <Text style={styles.ctaStatText}>Track Progress</Text>
              </View>
              <View style={styles.ctaStatItem}>
                <Ionicons name="time" size={18} color="#FFFFFF" />
                <Text style={styles.ctaStatText}>Flexible Time</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color="#d97706" />
              <Text style={styles.tipTitle}>Today's Tip</Text>
            </View>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Pro Tip:</Text> Practice for 15 minutes daily for best results. Consistency is the fastest way to build confidence.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  topNavbar: {
    backgroundColor: '#a61e22',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  navContent: {
    paddingVertical: 6,
  },
  heroShell: {
    backgroundColor: '#c9302c',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -70,
    right: -40,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -24,
    left: -20,
  },
  heroTextColumn: {
    flex: 1,
    zIndex: 1,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroEyebrow: {
    color: '#ffd9d9',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroStatusText: {
    color: '#fff4ec',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  heroSubtitle: {
    color: '#ffeaea',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 240,
  },
  heroInsightCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroInsightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#fff4ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInsightTextWrap: {
    flex: 1,
  },
  heroInsightTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  heroInsightText: {
    color: '#ffe0df',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  heroActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff3f1',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
  },
  heroPrimaryButtonText: {
    color: '#a61e22',
    fontSize: 14,
    fontWeight: '800',
  },
  heroGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  heroGhostButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  heroStatChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 74,
  },
  heroStatValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: '#ffdede',
    fontSize: 11,
    marginTop: 2,
  },
  heroBrandCard: {
    width: 112,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  heroBrandBadge: {
    alignSelf: 'stretch',
    borderRadius: 999,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  heroBrandBadgeText: {
    textAlign: 'center',
    color: '#fff4ec',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoIconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  logoIcon: {
    width: 130,
    height: 130,
  },
  logoTextWrapper: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },
  logoText: {
    width: 82,
    height: 24,
  },
  heroBrandCaption: {
    color: '#fff0f0',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  sectionCaption: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: '#c9302c',
    fontWeight: '700',
  },
  quickAccessPanel: {
    backgroundColor: '#fff4ef',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffd9cd',
  },
  panelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffedd5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  panelBadgeText: {
    color: '#9a3412',
    fontSize: 11,
    fontWeight: '800',
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickAccessTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
  },
  quickAccessText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 5,
  },
  quickAccessLink: {
    marginTop: 12,
    color: '#c9302c',
    fontSize: 12,
    fontWeight: '800',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 44) / 2,
    borderRadius: 22,
    overflow: 'hidden',
  },
  quickActionCardWide: {
    width: '100%',
  },
  cardGradient: {
    minHeight: 176,
    borderRadius: 22,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 18,
  },
  quickActionSubtext: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: '88%',
    minHeight: 38,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 16,
  },
  cardFooterText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  storyLoadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  storyLoadingText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  storyCarouselShell: {
    marginHorizontal: -16,
  },
  storyCarouselFrame: {
    paddingVertical: 4,
  },
  storyCarouselSlide: {
    width,
    paddingHorizontal: 16,
  },
  storySpotlightCard: {
    width: '100%',
    height: 244,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  storySpotlightImage: {
    width: '100%',
    height: '100%',
  },
  storySpotlightFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbe4f0',
  },
  storySpotlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
  },
  storySpotlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  storySpotlightBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  storySpotlightName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  storySpotlightExcerpt: {
    color: '#eef2ff',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  storyEmptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  storyEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 12,
  },
  storyEmptyText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  storyIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  storyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  storyIndicatorActive: {
    width: 24,
    backgroundColor: '#c9302c',
  },
  storyCountChip: {
    backgroundColor: '#fee2e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  storyCountChipText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: '#1f3b73',
    borderRadius: 24,
    padding: 22,
  },
  ctaEyebrow: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ctaTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
  },
  ctaSubtext: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  ctaButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#a61e22',
    fontSize: 14,
    fontWeight: '800',
  },
  ctaStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 18,
  },
  ctaStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaStatText: {
    color: '#e5edff',
    fontSize: 12,
    fontWeight: '700',
  },
  tipCard: {
    backgroundColor: '#fff6dd',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tipTitle: {
    color: '#92400e',
    fontSize: 15,
    fontWeight: '800',
  },
  tipText: {
    color: '#7c5b15',
    fontSize: 13,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '800',
    color: '#b45309',
  },
  bottomSpacing: {
    height: 88,
  },
});

export default HomePage;
