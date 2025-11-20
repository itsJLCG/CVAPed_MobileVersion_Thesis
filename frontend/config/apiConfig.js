/**
 * API Configuration
 * 
 * IMPORTANT: Change the BASE_IP to your computer's IPv4 address
 * 
 * To find your IPv4:
 * - Windows: Open CMD and type: ipconfig
 * - Look for "IPv4 Address" under your active network adapter
 * - Example: 192.168.1.64
 * 
 * Then update BASE_IP below with your IP address
 */

// ⚠️ CHANGE THIS TO YOUR COMPUTER'S IPv4 ADDRESS ⚠️
const BASE_IP = '192.168.0.47';

// Port Configuration (matches backend .env)
const PORTS = {
  MAIN_API: 5000,        // Node.js backend (auth, users)
  GAIT_ANALYSIS: 5001,   // Python Flask - Gait Analysis
  THERAPY: 5002,         // Python Flask - Therapy Exercises
};

// Constructed API URLs
export const API_CONFIG = {
  BASE_IP,
  
  // Main Node.js backend
  MAIN_API_URL: `http://${BASE_IP}:${PORTS.MAIN_API}/api`,
  
  // Gait Analysis service
  GAIT_API_URL: `http://${BASE_IP}:${PORTS.GAIT_ANALYSIS}`,
  
  // Therapy Exercises service
  THERAPY_API_URL: `http://${BASE_IP}:${PORTS.THERAPY}`,
};

// For debugging - log the current configuration
console.log('📡 API Configuration:', {
  'Main API': API_CONFIG.MAIN_API_URL,
  'Gait Analysis': API_CONFIG.GAIT_API_URL,
  'Therapy Exercises': API_CONFIG.THERAPY_API_URL,
});

export default API_CONFIG;
