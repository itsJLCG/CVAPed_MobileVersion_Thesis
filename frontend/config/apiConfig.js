const BASE_IP = process.env.EXPO_PUBLIC_API_URL 
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '').replace('http://', '').replace('https://', '')
  : '192.168.0.47';

const PORTS = {
  MAIN_API: process.env.EXPO_PUBLIC_API_URL ? 5000 : 5000,
  GAIT_ANALYSIS: process.env.EXPO_PUBLIC_GAIT_API_URL ? 5001 : 5001,
  THERAPY: process.env.EXPO_PUBLIC_THERAPY_API_URL ? 5002 : 5002,
};

const MAIN_API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${BASE_IP}:${PORTS.MAIN_API}/api`;
const GAIT_SERVICE_URL = process.env.EXPO_PUBLIC_GAIT_API_URL || `http://${BASE_IP}:${PORTS.GAIT_ANALYSIS}`;
const THERAPY_SERVICE_URL = process.env.EXPO_PUBLIC_THERAPY_API_URL || `http://${BASE_IP}:${PORTS.THERAPY}`;

export const API_CONFIG = {
  BASE_IP,
  MAIN_API_URL,
  GAIT_API_URL: GAIT_SERVICE_URL,
  THERAPY_API_URL: THERAPY_SERVICE_URL,
};

export const API_URL = MAIN_API_URL;
export const GAIT_API_URL = GAIT_SERVICE_URL;
export const THERAPY_API_URL = THERAPY_SERVICE_URL;

console.log('📡 API Configuration:', {
  'Main API': API_CONFIG.MAIN_API_URL,
  'Gait Analysis': API_CONFIG.GAIT_API_URL,
  'Therapy Exercises': API_CONFIG.THERAPY_API_URL,
});

export default API_CONFIG;
