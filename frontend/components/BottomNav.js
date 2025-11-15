import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.bottomNavbar}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onTabPress('home')}
      >
        <Ionicons 
          name={activeTab === 'home' ? 'home' : 'home-outline'} 
          size={28} 
          color={activeTab === 'home' ? '#C9302C' : '#666'} 
        />
        <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onTabPress('therapy')}
      >
        <Ionicons 
          name={activeTab === 'therapy' ? 'medkit' : 'medkit-outline'} 
          size={28} 
          color={activeTab === 'therapy' ? '#C9302C' : '#666'} 
        />
        <Text style={[styles.navText, activeTab === 'therapy' && styles.navTextActive]}>
          Therapy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onTabPress('health')}
      >
        <Ionicons 
          name={activeTab === 'health' ? 'heart' : 'heart-outline'} 
          size={28} 
          color={activeTab === 'health' ? '#C9302C' : '#666'} 
        />
        <Text style={[styles.navText, activeTab === 'health' && styles.navTextActive]}>
          Health
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => onTabPress('profile')}
      >
        <Ionicons 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={28} 
          color={activeTab === 'profile' ? '#C9302C' : '#666'} 
        />
        <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavbar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#C9302C',
    fontWeight: '700',
  },
});

export default BottomNav;
