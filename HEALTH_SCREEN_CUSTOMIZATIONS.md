# Health Screen - Customization Examples

## Common Customization Scenarios

### 1. Change Color Scheme

#### Update Therapy Type Colors
**File:** `frontend/components/HealthScreen.js`

**Location:** Find the `getTypeColor()` function

**Current Code:**
```javascript
const getTypeColor = (type) => {
  switch (type) {
    case 'articulation': return '#FF6B6B';
    case 'fluency': return '#4ECDC4';
    case 'receptive': return '#95E1D3';
    case 'expressive': return '#F38181';
    default: return '#999';
  }
};
```

**Customization Example:**
```javascript
const getTypeColor = (type) => {
  switch (type) {
    case 'articulation': return '#E74C3C'; // Darker red
    case 'fluency': return '#3498DB';      // Blue
    case 'receptive': return '#2ECC71';    // Green
    case 'expressive': return '#9B59B6';   // Purple
    default: return '#95A5A6';             // Gray
  }
};
```

#### Update Score Badge Colors
**Location:** Find the `getScoreColor()` function

**Current Code:**
```javascript
const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FFC107';
  return '#F44336';
};
```

**Customization Example (Different Thresholds):**
```javascript
const getScoreColor = (score) => {
  if (score >= 90) return '#27AE60';  // Excellent (90+)
  if (score >= 75) return '#F39C12';  // Good (75-89)
  if (score >= 60) return '#E67E22';  // Average (60-74)
  return '#E74C3C';                   // Needs work (<60)
};
```

---

### 2. Modify Date Format

#### Change Relative Date Display
**File:** `frontend/components/HealthScreen.js`

**Location:** Find the `formatDate()` function

**Current Code:**
```javascript
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
```

**Customization Example (Include Time):**
```javascript
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago at ${timeStr}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};
```

---

### 3. Add Pagination

#### Backend Pagination
**File:** `backend/controllers/healthController.js`

**Add to `getUserHealthLogs` function:**
```javascript
exports.getUserHealthLogs = async (req, res) => {
  try {
    const userId = req.user.uid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const logs = [];
    
    // ... existing aggregation code ...
    
    // Sort logs chronologically (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const totalLogs = logs.length;
    const paginatedLogs = logs.slice(skip, skip + limit);
    
    // Calculate summary statistics
    const summary = {
      // ... existing summary code ...
    };
    
    res.status(200).json({
      success: true,
      data: {
        logs: paginatedLogs,
        summary,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalLogs / limit),
          totalItems: totalLogs,
          itemsPerPage: limit,
          hasMore: skip + limit < totalLogs
        }
      }
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

#### Frontend Pagination
**File:** `frontend/components/HealthScreen.js`

**Add state:**
```javascript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
```

**Update fetch function:**
```javascript
const fetchHealthData = async (pageNum = 1) => {
  try {
    setError(null);
    const response = await healthAPI.getLogs(pageNum, 20); // 20 items per page
    
    if (response.success) {
      if (pageNum === 1) {
        setHealthLogs(response.data.logs);
      } else {
        setHealthLogs(prev => [...prev, ...response.data.logs]);
      }
      setSummary(response.data.summary);
      setHasMore(response.data.pagination.hasMore);
    }
  } catch (err) {
    // ... error handling ...
  }
};
```

**Add load more button:**
```javascript
{hasMore && (
  <TouchableOpacity 
    style={styles.loadMoreButton} 
    onPress={() => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHealthData(nextPage);
    }}
  >
    <Text style={styles.loadMoreText}>Load More</Text>
  </TouchableOpacity>
)}
```

---

### 4. Add Export Feature

#### Add Export Function
**File:** `frontend/components/HealthScreen.js`

**Install dependencies first:**
```powershell
npm install react-native-share react-native-fs
```

**Add export function:**
```javascript
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const exportToCSV = async () => {
  try {
    // Create CSV content
    const csvHeader = 'Date,Therapy Type,Score,Details\n';
    const csvRows = healthLogs.map(log => {
      const date = new Date(log.timestamp).toLocaleDateString();
      const details = log.target || log.exerciseName || 'N/A';
      return `${date},${log.therapyName},${log.score},${details}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Save to file
    const path = `${RNFS.DocumentDirectoryPath}/health-logs.csv`;
    await RNFS.writeFile(path, csvContent, 'utf8');
    
    // Share file
    await Share.open({
      url: `file://${path}`,
      type: 'text/csv',
      title: 'Health Logs Export'
    });
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Export Failed', 'Could not export health logs');
  }
};
```

**Add export button in header:**
```javascript
<TouchableOpacity onPress={exportToCSV} style={styles.exportButton}>
  <Ionicons name="download" size={24} color="#C9302C" />
</TouchableOpacity>
```

---

### 5. Add Search Functionality

**Add search state:**
```javascript
const [searchQuery, setSearchQuery] = useState('');
```

**Add search filter:**
```javascript
const getFilteredLogs = () => {
  let filtered = healthLogs;
  
  // Filter by type
  if (selectedFilter !== 'all') {
    filtered = filtered.filter(log => log.type === selectedFilter);
  }
  
  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(log => {
      const searchLower = searchQuery.toLowerCase();
      return (
        log.therapyName.toLowerCase().includes(searchLower) ||
        (log.target && log.target.toLowerCase().includes(searchLower)) ||
        (log.soundId && log.soundId.toLowerCase().includes(searchLower)) ||
        (log.exerciseName && log.exerciseName.toLowerCase().includes(searchLower))
      );
    });
  }
  
  return filtered;
};
```

**Add search bar:**
```javascript
<View style={styles.searchContainer}>
  <Ionicons name="search" size={20} color="#999" />
  <TextInput
    style={styles.searchInput}
    placeholder="Search logs..."
    value={searchQuery}
    onChangeText={setSearchQuery}
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Ionicons name="close-circle" size={20} color="#999" />
    </TouchableOpacity>
  )}
</View>
```

---

### 6. Add Date Range Filter

**Add date range state:**
```javascript
const [dateRange, setDateRange] = useState({
  start: null,
  end: null
});
```

**Add date filter:**
```javascript
const getFilteredLogs = () => {
  let filtered = healthLogs;
  
  // Filter by type
  if (selectedFilter !== 'all') {
    filtered = filtered.filter(log => log.type === selectedFilter);
  }
  
  // Filter by date range
  if (dateRange.start && dateRange.end) {
    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dateRange.start && logDate <= dateRange.end;
    });
  }
  
  return filtered;
};
```

**Add date picker buttons:**
```javascript
import DateTimePicker from '@react-native-community/datetimepicker';

<View style={styles.dateRangeContainer}>
  <TouchableOpacity 
    style={styles.dateButton}
    onPress={() => setShowStartPicker(true)}
  >
    <Text>Start: {dateRange.start?.toLocaleDateString() || 'Select'}</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.dateButton}
    onPress={() => setShowEndPicker(true)}
  >
    <Text>End: {dateRange.end?.toLocaleDateString() || 'Select'}</Text>
  </TouchableOpacity>
  
  {dateRange.start && (
    <TouchableOpacity onPress={() => setDateRange({ start: null, end: null })}>
      <Ionicons name="close" size={24} color="#C9302C" />
    </TouchableOpacity>
  )}
</View>
```

---

### 7. Add Charts/Graphs

**Install chart library:**
```powershell
npm install react-native-chart-kit
```

**Add progress chart:**
```javascript
import { LineChart } from 'react-native-chart-kit';

const renderProgressChart = () => {
  // Group logs by date and calculate average score
  const dateScores = {};
  
  healthLogs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!dateScores[date]) {
      dateScores[date] = { total: 0, count: 0 };
    }
    dateScores[date].total += log.score;
    dateScores[date].count += 1;
  });
  
  const dates = Object.keys(dateScores).slice(-7); // Last 7 days
  const scores = dates.map(date => 
    dateScores[date].total / dateScores[date].count
  );
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Progress Over Time</Text>
      <LineChart
        data={{
          labels: dates.map(d => new Date(d).getDate().toString()),
          datasets: [{ data: scores }]
        }}
        width={width - 30}
        height={220}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(201, 48, 44, ${opacity})`,
          style: { borderRadius: 16 }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};
```

---

### 8. Add Sorting Options

**Add sort state:**
```javascript
const [sortBy, setSortBy] = useState('date'); // 'date' | 'score' | 'type'
const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
```

**Add sorting logic:**
```javascript
const getSortedLogs = (logs) => {
  return [...logs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
        break;
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};
```

**Add sort menu:**
```javascript
<View style={styles.sortContainer}>
  <TouchableOpacity onPress={() => setSortBy('date')}>
    <Text style={[styles.sortOption, sortBy === 'date' && styles.sortActive]}>
      Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
    </Text>
  </TouchableOpacity>
  
  <TouchableOpacity onPress={() => setSortBy('score')}>
    <Text style={[styles.sortOption, sortBy === 'score' && styles.sortActive]}>
      Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
    </Text>
  </TouchableOpacity>
  
  <TouchableOpacity onPress={() => setSortBy('type')}>
    <Text style={[styles.sortOption, sortBy === 'type' && styles.sortActive]}>
      Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
    </Text>
  </TouchableOpacity>
</View>
```

---

### 9. Add Detailed View Modal

**Add modal state:**
```javascript
const [selectedLog, setSelectedLog] = useState(null);
const [showDetailModal, setShowDetailModal] = useState(false);
```

**Make log cards clickable:**
```javascript
<TouchableOpacity 
  onPress={() => {
    setSelectedLog(log);
    setShowDetailModal(true);
  }}
>
  {renderLogCard(log)}
</TouchableOpacity>
```

**Add modal:**
```javascript
import { Modal } from 'react-native';

<Modal
  visible={showDetailModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowDetailModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Session Details</Text>
        <TouchableOpacity onPress={() => setShowDetailModal(false)}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      
      {selectedLog && (
        <ScrollView>
          <Text style={styles.detailLabel}>Therapy Type:</Text>
          <Text style={styles.detailValue}>{selectedLog.therapyName}</Text>
          
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(selectedLog.timestamp).toLocaleString()}
          </Text>
          
          <Text style={styles.detailLabel}>Score:</Text>
          <Text style={styles.detailValue}>{selectedLog.score}</Text>
          
          {/* Add more details based on therapy type */}
        </ScrollView>
      )}
    </View>
  </View>
</Modal>
```

---

### 10. Add Offline Support

**Install AsyncStorage (already in project):**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
```

**Cache logs:**
```javascript
const fetchHealthData = async () => {
  try {
    // Try to load from cache first
    const cachedLogs = await AsyncStorage.getItem('healthLogs');
    if (cachedLogs) {
      setHealthLogs(JSON.parse(cachedLogs));
    }
    
    // Fetch fresh data
    const response = await healthAPI.getLogs();
    
    if (response.success) {
      setHealthLogs(response.data.logs);
      setSummary(response.data.summary);
      
      // Cache the data
      await AsyncStorage.setItem('healthLogs', JSON.stringify(response.data.logs));
      await AsyncStorage.setItem('healthSummary', JSON.stringify(response.data.summary));
    }
  } catch (err) {
    // If offline, use cached data
    console.error('Error fetching health data:', err);
  }
};
```

---

## Styling Customizations

### Update Card Style
```javascript
logCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,           // More rounded
  padding: 20,                // More padding
  marginBottom: 15,
  elevation: 4,               // Higher shadow on Android
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,        // Darker shadow
  shadowRadius: 4,
  borderLeftWidth: 4,         // Add colored left border
  borderLeftColor: '#C9302C', // Dynamic based on type
},
```

### Update Typography
```javascript
therapyName: {
  fontSize: 18,               // Larger
  fontWeight: '700',          // Bolder
  color: '#2C3E50',          // Darker
  letterSpacing: 0.5,         // Letter spacing
},
```

---

## Summary

These customization examples show you how to:
- ✅ Change colors and styling
- ✅ Modify date formats
- ✅ Add pagination
- ✅ Export data
- ✅ Add search
- ✅ Filter by date range
- ✅ Add charts
- ✅ Add sorting
- ✅ Create detail modals
- ✅ Implement offline support

Pick and choose the features you need for your specific use case!
