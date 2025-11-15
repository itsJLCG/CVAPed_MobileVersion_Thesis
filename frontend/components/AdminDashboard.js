import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../services/api';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview') {
        const statsResponse = await adminAPI.getStats(userData.token);
        if (statsResponse.success) {
          setStats(statsResponse);
        }
      } else if (activeTab === 'users') {
        const usersResponse = await adminAPI.getAllUsers(userData.token);
        if (usersResponse.success) {
          setUsers(usersResponse.users);
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', error.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminAPI.deleteUser(userData.token, userId);
              if (response.success) {
                Alert.alert('Success', 'User deleted successfully');
                loadAdminData();
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    setEditModalVisible(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      const response = await adminAPI.updateUser(userData.token, selectedUser.id, {
        role: editingRole
      });
      
      if (response.success) {
        Alert.alert('Success', 'User role updated successfully');
        setEditModalVisible(false);
        setSelectedUser(null);
        loadAdminData();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update user role');
    }
  };

  const toggleUserDetails = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderOverview = () => {
    if (!stats) return null;

    const statsCards = [
      {
        id: 1,
        title: 'Total Users',
        value: stats.stats.total_users.toLocaleString(),
        icon: '👥',
        color: '#479ac3',
        bgColor: '#479ac315'
      },
      {
        id: 2,
        title: 'Admin Users',
        value: stats.stats.admin_users.toLocaleString(),
        icon: '👨‍💼',
        color: '#ce3630',
        bgColor: '#ce363015'
      },
      {
        id: 3,
        title: 'Verified Users',
        value: stats.stats.verified_users.toLocaleString(),
        icon: '✅',
        color: '#27ae60',
        bgColor: '#27ae6015'
      },
      {
        id: 4,
        title: 'Patient Users',
        value: stats.stats.patient_users.toLocaleString(),
        icon: '🏥',
        color: '#3498db',
        bgColor: '#3498db15'
      },
      {
        id: 5,
        title: 'Speech Therapy',
        value: stats.stats.speech_users.toLocaleString(),
        icon: '🗣️',
        color: '#e8b04e',
        bgColor: '#e8b04e15'
      },
      {
        id: 6,
        title: 'Physical Therapy',
        value: stats.stats.physical_users.toLocaleString(),
        icon: '�',
        color: '#9b59b6',
        bgColor: '#9b59b615'
      }
    ];

    return (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C9302C']} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsCards.map(stat => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Therapy Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Therapy Distribution</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>
                {stats.therapy_distribution.speech + stats.therapy_distribution.physical} Total
              </Text>
            </View>
          </View>
          <View style={styles.distributionCard}>
            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionDot, { backgroundColor: '#ce3630' }]} />
                <Text style={styles.distributionLabel}>Speech Therapy</Text>
              </View>
              <View style={styles.distributionValueContainer}>
                <Text style={styles.distributionValue}>{stats.therapy_distribution.speech}</Text>
                <Text style={styles.distributionPercent}>
                  {((stats.therapy_distribution.speech / (stats.therapy_distribution.speech + stats.therapy_distribution.physical || 1)) * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionDot, { backgroundColor: '#479ac3' }]} />
                <Text style={styles.distributionLabel}>Physical Therapy</Text>
              </View>
              <View style={styles.distributionValueContainer}>
                <Text style={styles.distributionValue}>{stats.therapy_distribution.physical}</Text>
                <Text style={styles.distributionPercent}>
                  {((stats.therapy_distribution.physical / (stats.therapy_distribution.speech + stats.therapy_distribution.physical || 1)) * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Verification Rate</Text>
              <Text style={styles.summaryValue}>
                {((stats.stats.verified_users / stats.stats.total_users) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Admin Coverage</Text>
              <Text style={styles.summaryValue}>
                {((stats.stats.admin_users / stats.stats.total_users) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Patient Users</Text>
              <Text style={styles.summaryValue}>
                {((stats.stats.patient_users / stats.stats.total_users) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Users - Limit to 5 */}
        {stats.recent_users && stats.recent_users.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Registrations</Text>
              <Text style={styles.sectionSubtitle}>Last 5 users</Text>
            </View>
            <View style={styles.recentUsersContainer}>
              {stats.recent_users.slice(0, 5).map((user, index) => {
                const userName = user.name || 'Unknown User';
                const initials = userName.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2);
                
                return (
                  <View key={index} style={styles.recentUserItem}>
                    <View style={styles.recentUserAvatar}>
                      <Text style={styles.recentUserAvatarText}>
                        {initials || '??'}
                      </Text>
                    </View>
                    <View style={styles.recentUserInfo}>
                      <Text style={styles.recentUserName}>{userName}</Text>
                      <Text style={styles.recentUserEmail}>{user.email}</Text>
                    </View>
                    <View style={styles.recentUserMeta}>
                      {user.therapyType && (
                        <View style={[styles.miniTag, styles[`miniTag_${user.therapyType}`]]}>
                          <Text style={styles.miniTagText}>{user.therapyType}</Text>
                        </View>
                      )}
                      <Text style={styles.recentUserDate}>{formatDate(user.joinedAt)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  const renderUsers = () => {
    const filteredUsersData = users.filter(user =>
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.therapyType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.resultsCount}>
          Showing {filteredUsersData.length} of {users.length} users
        </Text>

        <ScrollView
          style={styles.usersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C9302C']} />
          }
        >
          {filteredUsersData.map((user) => {
            const isExpanded = expandedUserId === user.id;
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
            const initials = `${firstName.charAt(0) || '?'}${lastName.charAt(0) || '?'}`;

            return (
              <View key={user.id} style={styles.userCard}>
                <TouchableOpacity
                  style={styles.userCardHeader}
                  onPress={() => toggleUserDetails(user.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.userCardLeft}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {initials}
                      </Text>
                    </View>
                    <View style={styles.userCardInfo}>
                      <Text style={styles.userName}>{fullName}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <View style={styles.userTags}>
                        <View style={[styles.badge, styles[`badge_${user.role}`]]}>
                          <Text style={styles.badgeText}>{user.role}</Text>
                        </View>
                        {user.therapyType !== 'N/A' && (
                          <View style={[styles.badge, styles[`badge_${user.therapyType}`]]}>
                            <Text style={styles.badgeText}>{user.therapyType}</Text>
                          </View>
                        )}
                        {user.isVerified && (
                          <View style={[styles.badge, styles.badge_verified]}>
                            <Ionicons name="checkmark-circle" size={12} color="#27ae60" />
                            <Text style={[styles.badgeText, { color: '#27ae60' }]}>Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.userCardBody}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Basic Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>User ID:</Text>
                        <Text style={styles.detailValue}>{user.id}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{user.phone || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Verified:</Text>
                        <Text style={[styles.detailValue, user.isVerified ? styles.textGreen : styles.textRed]}>
                          {user.isVerified ? 'Yes ✓' : 'No ✗'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Patient Type:</Text>
                        <Text style={styles.detailValue}>{user.patientType || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Joined:</Text>
                        <Text style={styles.detailValue}>{formatDate(user.created_at)}</Text>
                      </View>
                    </View>

                    {/* Child Info (for Physical Therapy) */}
                    {user.childInfo && Object.keys(user.childInfo).length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Child Information</Text>
                        {user.childInfo.name && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Name:</Text>
                            <Text style={styles.detailValue}>{user.childInfo.name}</Text>
                          </View>
                        )}
                        {user.childInfo.age && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Age:</Text>
                            <Text style={styles.detailValue}>{user.childInfo.age}</Text>
                          </View>
                        )}
                        {user.childInfo.condition && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Condition:</Text>
                            <Text style={styles.detailValue}>{user.childInfo.condition}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Parent Info */}
                    {user.parentInfo && Object.keys(user.parentInfo).length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Parent/Guardian Information</Text>
                        {user.parentInfo.name && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Name:</Text>
                            <Text style={styles.detailValue}>{user.parentInfo.name}</Text>
                          </View>
                        )}
                        {user.parentInfo.phone && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone:</Text>
                            <Text style={styles.detailValue}>{user.parentInfo.phone}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Patient Info (for Speech Therapy) */}
                    {user.patientInfo && Object.keys(user.patientInfo).length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Patient Information</Text>
                        {user.patientInfo.name && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Name:</Text>
                            <Text style={styles.detailValue}>{user.patientInfo.name}</Text>
                          </View>
                        )}
                        {user.patientInfo.phone && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone:</Text>
                            <Text style={styles.detailValue}>{user.patientInfo.phone}</Text>
                          </View>
                        )}
                        {user.patientInfo.age && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Age:</Text>
                            <Text style={styles.detailValue}>{user.patientInfo.age}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditUser(user)}
                      >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Edit Role</Text>
                      </TouchableOpacity>
                      {user.role !== 'admin' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButtonAction]}
                          onPress={() => handleDeleteUser(user.id, fullName)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {filteredUsersData.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {userData?.firstName}!</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#C9302C" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={activeTab === 'overview' ? '#C9302C' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'users' ? '#C9302C' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9302C" />
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
        </>
      )}

      {/* Role Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Role</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.modalBody}>
                <View style={styles.userInfoModal}>
                  <View style={styles.userAvatarModal}>
                    <Text style={styles.userAvatarText}>
                      {(selectedUser.firstName?.charAt(0) || '?')}{(selectedUser.lastName?.charAt(0) || '?')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalUserName}>
                      {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'Unknown User'}
                    </Text>
                    <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  </View>
                </View>

                <View style={styles.roleSelector}>
                  <Text style={styles.roleSelectorLabel}>Select New Role:</Text>
                  <View style={styles.roleOptions}>
                    {['admin', 'patient', 'therapist'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          editingRole === role && styles.roleOptionSelected
                        ]}
                        onPress={() => setEditingRole(role)}
                      >
                        <View style={[
                          styles.roleRadio,
                          editingRole === role && styles.roleRadioSelected
                        ]}>
                          {editingRole === role && (
                            <View style={styles.roleRadioInner} />
                          )}
                        </View>
                        <Text style={[
                          styles.roleOptionText,
                          editingRole === role && styles.roleOptionTextSelected
                        ]}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSave]}
                    onPress={handleUpdateRole}
                  >
                    <Text style={styles.modalButtonTextSave}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#C9302C',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#C9302C',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  distributionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityName: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    margin: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  resultsCount: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 12,
    color: '#999',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badge_admin: {
    backgroundColor: '#ce363015',
  },
  badge_patient: {
    backgroundColor: '#479ac315',
  },
  badge_therapist: {
    backgroundColor: '#27ae6015',
  },
  badge_speech: {
    backgroundColor: '#e8b04e15',
  },
  badge_physical: {
    backgroundColor: '#9b59b615',
  },
  badge_verified: {
    backgroundColor: '#27ae6015',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  // Enhanced Overview Styles
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionBadge: {
    backgroundColor: '#C9302C15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9302C',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  distributionValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  recentUsersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recentUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  recentUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentUserAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentUserInfo: {
    flex: 1,
  },
  recentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  recentUserEmail: {
    fontSize: 12,
    color: '#999',
  },
  recentUserMeta: {
    alignItems: 'flex-end',
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  miniTag_speech: {
    backgroundColor: '#e8b04e15',
  },
  miniTag_physical: {
    backgroundColor: '#9b59b615',
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  recentUserDate: {
    fontSize: 10,
    color: '#999',
  },
  // Enhanced User Card Styles
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardBody: {
    paddingTop: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    width: '35%',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '400',
    width: '60%',
    textAlign: 'left',
  },
  textGreen: {
    color: '#27ae60',
  },
  textRed: {
    color: '#e74c3c',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButtonAction: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  roleTag_admin: {
    backgroundColor: '#ce363015',
  },
  roleTag_patient: {
    backgroundColor: '#479ac315',
  },
  roleTag_therapist: {
    backgroundColor: '#27ae6015',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  therapyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  therapyTag_speech: {
    backgroundColor: '#e8b04e15',
  },
  therapyTag_physical: {
    backgroundColor: '#9b59b615',
  },
  therapyTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  userCountContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  userCountText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalBody: {
    padding: 20,
  },
  userInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  userAvatarModal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9302C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  modalUserEmail: {
    fontSize: 13,
    color: '#666',
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  roleOptions: {
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  roleOptionSelected: {
    borderColor: '#C9302C',
    backgroundColor: '#C9302C05',
  },
  roleRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleRadioSelected: {
    borderColor: '#C9302C',
  },
  roleRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C9302C',
  },
  roleOptionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: '#C9302C',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSave: {
    backgroundColor: '#C9302C',
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextSave: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminDashboard;
