/**
 * IndexedDB Storage for PWA-compatible persistent authentication
 * IndexedDB is more reliable than localStorage in PWAs
 */

const DB_NAME = 'SousChefyDB';
const DB_VERSION = 1;
const STORE_NAME = 'auth';

interface AuthData {
  token?: string;
  user?: any;
}

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Get auth data from IndexedDB
 */
async function getAuthData(): Promise<AuthData> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('auth');

      request.onsuccess = () => {
        resolve(request.result || {});
      };

      request.onerror = () => {
        reject(new Error('Failed to get auth data from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error getting auth data from IndexedDB:', error);
    return {};
  }
}

/**
 * Set auth token in IndexedDB
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    const db = await openDB();
    const authData = await getAuthData();
    authData.token = token;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(authData, 'auth');

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to set auth token in IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error setting auth token in IndexedDB:', error);
  }
}

/**
 * Get auth token from IndexedDB
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const authData = await getAuthData();
    return authData.token || null;
  } catch (error) {
    console.error('Error getting auth token from IndexedDB:', error);
    return null;
  }
}

/**
 * Clear auth token from IndexedDB
 */
export async function clearAuthToken(): Promise<void> {
  try {
    const db = await openDB();
    const authData = await getAuthData();
    delete authData.token;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(authData, 'auth');

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear auth token in IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error clearing auth token from IndexedDB:', error);
  }
}

/**
 * Set user data in IndexedDB
 */
export async function setUserData(user: any): Promise<void> {
  try {
    const db = await openDB();
    const authData = await getAuthData();
    authData.user = user;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(authData, 'auth');

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to set user data in IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error setting user data in IndexedDB:', error);
  }
}

/**
 * Get user data from IndexedDB
 */
export async function getUserData(): Promise<any | null> {
  try {
    const authData = await getAuthData();
    return authData.user || null;
  } catch (error) {
    console.error('Error getting user data from IndexedDB:', error);
    return null;
  }
}

/**
 * Clear user data from IndexedDB
 */
export async function clearUserData(): Promise<void> {
  try {
    const db = await openDB();
    const authData = await getAuthData();
    delete authData.user;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(authData, 'auth');

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear user data in IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error clearing user data from IndexedDB:', error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Clear all auth data from IndexedDB
 */
export async function clearAllAuthData(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('auth');

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear auth data from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error clearing all auth data from IndexedDB:', error);
  }
}
