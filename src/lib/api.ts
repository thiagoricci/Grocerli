import axios from 'axios'
import { getAuthToken } from './indexedDB'

/**
 * Update cached token for interceptors
 */
export function updateCachedToken(token: string | null) {
  cachedToken = token;
}

/**
 * Normalize API base URL by removing trailing slashes
 * Ensures consistent path concatenation
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:3001')

// Token cache for synchronous access in interceptors
let cachedToken: string | null = null;

// Update token cache from IndexedDB
getAuthToken().then(token => {
  cachedToken = token;
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Only logout on 401 (invalid token), not on network errors
    if (error.response?.status === 401) {
      // Clear IndexedDB
      const { clearAuthToken, clearUserData } = require('./indexedDB');
      clearAuthToken().catch(console.error);
      clearUserData().catch(console.error);
      // Clear cached token
      cachedToken = null;
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { apiClient }
