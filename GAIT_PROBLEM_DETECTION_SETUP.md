# Gait Problem Detection Setup Guide

## 🎯 Overview

This system uses **PhysioNet Gait in Neurodegenerative Disease Database** to detect gait problems with scientific validity. It compares user gait metrics against baselines from healthy subjects to identify abnormalities.

---

## 📋 Prerequisites

- Python 3.8+ installed
- Active internet connection (for dataset download)
- MongoDB running (for saving results)
- Node.js backend running (gait routes)

---

## 🚀 Step-by-Step Setup

### **Step 1: Install Python Dependencies**

```powershell
cd backend\gait-analysis
pip install -r requirements.txt
```

This installs:
- Flask & Flask-CORS (web framework)
- NumPy & SciPy (signal processing)
- Pandas (data processing)

---

### **Step 2: Download PhysioNet Dataset (Manual)**

1. **Download from PhysioNet**:
   - Visit: https://physionet.org/content/gaitndd/1.0.0/
   - Download the ZIP file
   - Extract to: `backend\gait-analysis\datasets\physionet_gait\gait-in-neurodegenerative-disease-database-1.0.0\`

2. **Generate Baselines**:
   ```powershell
   python process_physionet_data.py
   ```

**What this does:**
1. Reads binary gait timing files (.let/.rit) from 16 control subjects
2. Calculates gait metrics (cadence, stride, velocity, symmetry, etc.)
3. Generates statistical baselines (mean, std, percentiles)
4. Creates `gait_baselines.json` with normal ranges

**Expected output:**
```
Processing PhysioNet control subjects...
Found 16 control subjects
Processed control1: cadence=100.7, velocity=1.33, stride_length=1.59
Processed control2: cadence=103.9, velocity=1.47, stride_length=1.70
...

cadence:
  Mean: 95.696 ± 5.743
  Range: [86.191, 105.036]
  Percentiles: p5=87.877, p25=90.261, p75=100.533, p95=104.196
  Samples: 16

✓ Baselines saved to gait_baselines.json
✓ Generated statistics from 16 control subjects
```

**Generated file:**
- `datasets/physionet_gait/gait_baselines.json` - Used by problem detector

---

### **Step 3: Test Problem Detection**

Test the problem detector with sample data:

```powershell
python test_physionet_baselines.py
```

**Expected output:**
```
✓ Loaded gait baselines from: PhysioNet Gait in Neurodegenerative Disease Database

Test Case 1: Normal Gait Pattern
Detected 0 problems

Test Case 2: Impaired Gait Pattern
Detected 6 problems
  - slow_cadence: severe (percentile: 3.2)
  - asymmetric_gait: severe (percentile: 4.1)
  ...

✓ ALL TESTS PASSED
```
  Status: needs_immediate_attention
  Risk Level: high
  Problems Detected: 3

Detected problems using PhysioNet baselines...

🔍 Detected Problems:

1. SLOW_CADENCE (SEVERE)
   Your walking pace (31.3 steps/min) is significantly slower than normal (below 5th percentile).
   Recommendations:
     - Metronome-paced walking at progressively faster tempos
     - High knee marching exercises

2. SHORT_STRIDE (SEVERE)
   Your stride length (0.57m) is significantly shorter than normal (below 8th percentile).
   Recommendations:
     - Lunge walking exercises to extend stride
     - Heel-to-toe walking with exaggerated steps

3. SLOW_VELOCITY (SEVERE)
   Your walking speed (0.30 m/s) is significantly slower than normal (below 6th percentile).
   Recommendations:
     - Progressive treadmill training
     - Fast walking intervals
```

---

### **Step 4: Start Flask Server**

The gait analysis Flask server should already be running. If not:

```powershell
cd backend\gait-analysis
python app.py
```

**Check that problem detector loaded:**
```
✓ Problem detector initialized with PhysioNet baselines
  Metrics available: ['cadence', 'gait_symmetry', 'stride_length_estimate', 'velocity_estimate', ...]
```

**If you see this warning:**
```
⚠️  Problem detector not available: Baselines file not found
   Run 'python dataset_downloader.py' to generate baselines
```
→ Go back to Step 2 and run the dataset downloader.

---

### **Step 5: Start Node.js Backend**

```powershell
cd backend
.\start-all.ps1
```

This starts:
- MongoDB connection
- Node.js Express server (port 5000)
- Python Flask gait service (port 5001)
- Python Flask therapy exercises service (port 5002)

---

### **Step 6: Test the Complete Flow**

#### **6.1: Test Problem Detection API Directly**

```powershell
# Using curl or Postman
curl -X POST http://localhost:5001/api/gait/detect-problems ^
  -H "Content-Type: application/json" ^
  -d "{\"metrics\": {\"cadence\": 31.26, \"stride_length\": 0.57, \"velocity\": 0.3, \"gait_symmetry\": 0.92, \"stability_score\": 0.81, \"step_regularity\": 0.78}}"
```

**Expected response:**
```json
{
  "success": true,
  "problems_detected": 3,
  "problems": [
    {
      "problem": "slow_cadence",
      "severity": "severe",
      "category": "Speed & Rhythm",
      "current_value": 31.3,
      "normal_range": "95.2 - 115.6",
      "description": "Your walking pace (31.3 steps/min) is significantly slower than normal...",
      "recommendations": ["Metronome-paced walking...", ...]
    }
  ],
  "summary": {
    "overall_status": "needs_immediate_attention",
    "risk_level": "high",
    "total_problems": 3
  }
}
```

#### **6.2: Test via Frontend**

1. Start frontend: `npx expo start`
2. Open app on device/emulator
3. Navigate to: **Physical Therapy → Gait Analysis**
4. Record a walking session (30+ seconds)
5. Stop recording and analyze
6. **New:** Problems will be detected automatically and displayed!

---

## 📊 How It Works

### **Data Flow:**

```
📱 User walks while recording
   ↓
🔍 Gait Analysis (gait_processor.py)
   → Calculates: cadence, stride length, velocity, symmetry, stability
   ↓
⚠️ Problem Detection (problem_detector.py)
   → Compares metrics to PhysioNet baselines
   → Identifies: Below 5th percentile = severe, Below 25th = moderate
   → Generates: Problem descriptions + recommendations
   ↓
💾 Save to MongoDB (GaitProgress collection)
   → Stores: metrics + detected_problems + problem_summary
   ↓
📱 Frontend Display
   → Shows: Problems with severity badges
   → Shows: Current value vs normal range
   → Shows: Personalized recommendations
```

### **Statistical Approach:**

```python
# Example: Cadence Analysis
baseline = {
  'mean': 105.2,      # Average from healthy controls
  'std': 12.4,        # Standard deviation
  'p5': 85.1,         # 5th percentile (lower threshold)
  'p25': 95.2,        # 25th percentile
  'p75': 115.6,       # 75th percentile
  'p95': 125.3        # 95th percentile (upper threshold)
}

user_cadence = 31.3

if user_cadence < baseline['p5']:  # Below 5th percentile
    severity = 'severe'
    percentile = calculate_percentile(31.3, baseline)  # ~1st percentile
    # "Your cadence is in the 1st percentile"
```

---

## 🗂️ File Structure

```
backend/
├── gait-analysis/
│   ├── app.py                    # Flask server with /detect-problems endpoint
│   ├── gait_processor.py         # Signal processing & metrics calculation
│   ├── problem_detector.py       # Problem detection using baselines
│   ├── dataset_downloader.py     # PhysioNet dataset downloader
│   ├── requirements.txt          # Python dependencies (added pandas, requests)
│   └── datasets/
│       └── physionet_gait/
│           ├── gait_baselines.json       # ⭐ Statistical baselines
│           ├── all_gait_metrics.json     # Raw processed data
│           ├── control01.txt - control16.txt
│           ├── als01.txt - als13.txt
│           ├── hunt01.txt - hunt20.txt
│           └── park01.txt - park15.txt

├── routes/
│   └── gaitRoutes.js             # Node.js endpoint that calls problem detection

├── models/
│   └── GaitProgress.js           # MongoDB schema with detected_problems field

frontend/
└── components/
    └── therapy/
        └── GaitAnalysisScreen.js  # UI with problems section
```

---

## 🎨 Frontend Features

### **New UI Components:**

1. **Problems Section** (shown if problems detected)
   - Risk level badge (High/Moderate/Low Priority)
   - Summary text with problem count
   - Individual problem cards with:
     * Category & severity badge
     * Description
     * Current value vs normal range
     * Percentile ranking
     * Impact explanation
     * Exercise recommendations (top 3)
   - "View Exercise Plan" button

2. **No Problems Card** (shown if all metrics normal)
   - Green checkmark icon
   - Encouraging message
   - "Keep up the good work" text

---

## 🔧 Troubleshooting

### **Issue: "Baselines file not found"**
**Solution:** Run `python dataset_downloader.py`

### **Issue: Download fails / Connection timeout**
**Solution:** 
- Check internet connection
- PhysioNet might be down temporarily
- Try again later
- Files are cached, so partial downloads will resume

### **Issue: No problems showing in frontend**
**Solution:**
- Check Flask logs: `python app.py` should show "✓ Problem detector initialized"
- Check Node.js logs for "✓ Problem detection: X issue(s) found"
- Verify `gait_baselines.json` exists in `datasets/physionet_gait/`

### **Issue: Frontend shows "No data" for problems**
**Solution:**
- Restart Flask server: `python app.py`
- Check that analysis result includes `detected_problems` field
- Clear app cache and reload

---

## 📈 Next Steps

### **Phase 2: Exercise Recommendations** (Coming Soon)
- Map detected problems → Specific exercises
- Create exercise library with video demonstrations
- Track exercise completion
- Re-run gait analysis to measure improvement

### **Phase 3: Progress Tracking**
- Compare gait metrics over time
- Show trend charts (cadence improving, etc.)
- Weekly/monthly progress reports
- Goal setting & achievement tracking

---

## 📚 References

- **PhysioNet Database:** https://physionet.org/content/gaitndd/1.0.0/
- **Citation:** Hausdorff JM, et al. (2000). "Gait variability and fall risk in community-living older adults." Journal of the American Geriatrics Society.
- **Dataset Description:** 64 subjects (16 healthy, 13 ALS, 20 Huntington's, 15 Parkinson's)

---

## ✅ Verification Checklist

- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] PhysioNet dataset downloaded (64 .txt files in `datasets/physionet_gait/`)
- [ ] Baselines generated (`gait_baselines.json` exists)
- [ ] Problem detector test passed (`python problem_detector.py`)
- [ ] Flask server running with "✓ Problem detector initialized" message
- [ ] Node.js backend running
- [ ] Frontend updated with problems display UI
- [ ] Test recording shows detected problems in app

---

**Setup Complete!** 🎉

Your gait analysis system now uses **medically validated baselines** to detect problems and provide evidence-based recommendations!
