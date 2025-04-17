/**
 * Storage Service
 * Handles data persistence for the UnwrapLater app using various storage mechanisms
 */
const Storage = (() => {
    // Storage availability checks
    const isLocalStorageAvailable = () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };
    
    const isSessionStorageAvailable = () => {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };
    
    const isIndexedDBAvailable = () => {
        return window.indexedDB !== undefined;
    };
    
    // Configuration
    const config = {
        useLocalStorage: isLocalStorageAvailable(),
        useSessionStorage: isSessionStorageAvailable(),
        useIndexedDB: isIndexedDBAvailable(),
        prefix: 'unwraplater_', // Prefix for all storage keys
        defaultExpiry: 86400000, // Default expiry time (1 day in milliseconds)
        dbName: 'UnwrapLaterDB',
        dbVersion: 1
    };
    
    // Local Storage operations
    const localStorageSet = (key, value, expiry = null) => {
        if (!config.useLocalStorage) return false;
        
        const prefixedKey = config.prefix + key;
        const storageItem = {
            value: value,
            expiry: expiry ? Date.now() + expiry : null
        };
        
        try {
            localStorage.setItem(prefixedKey, JSON.stringify(storageItem));
            return true;
        } catch (e) {
            console.error('Error storing in localStorage:', e);
            return false;
        }
    };
    
    const localStorageGet = (key) => {
        if (!config.useLocalStorage) return null;
        
        const prefixedKey = config.prefix + key;
        
        try {
            const item = localStorage.getItem(prefixedKey);
            if (!item) return null;
            
            const parsedItem = JSON.parse(item);
            
            // Check if item has expired
            if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
                localStorage.removeItem(prefixedKey);
                return null;
            }
            
            return parsedItem.value;
        } catch (e) {
            console.error('Error retrieving from localStorage:', e);
            return null;
        }
    };
    
    const localStorageRemove = (key) => {
        if (!config.useLocalStorage) return false;
        
        const prefixedKey = config.prefix + key;
        
        try {
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    };
    
    const localStorageClear = (onlyAppItems = true) => {
        if (!config.useLocalStorage) return false;
        
        try {
            if (onlyAppItems) {
                // Only clear items with our prefix
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(config.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // Clear all local storage
                localStorage.clear();
            }
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    };
    
    // Session Storage operations
    const sessionStorageSet = (key, value) => {
        if (!config.useSessionStorage) return false;
        
        const prefixedKey = config.prefix + key;
        
        try {
            sessionStorage.setItem(prefixedKey, JSON.stringify({ value }));
            return true;
        } catch (e) {
            console.error('Error storing in sessionStorage:', e);
            return false;
        }
    };
    
    const sessionStorageGet = (key) => {
        if (!config.useSessionStorage) return null;
        
        const prefixedKey = config.prefix + key;
        
        try {
            const item = sessionStorage.getItem(prefixedKey);
            if (!item) return null;
            
            return JSON.parse(item).value;
        } catch (e) {
            console.error('Error retrieving from sessionStorage:', e);
            return null;
        }
    };
    
    const sessionStorageRemove = (key) => {
        if (!config.useSessionStorage) return false;
        
        const prefixedKey = config.prefix + key;
        
        try {
            sessionStorage.removeItem(prefixedKey);
            return true;
        } catch (e) {
            console.error('Error removing from sessionStorage:', e);
            return false;
        }
    };
    
    const sessionStorageClear = (onlyAppItems = true) => {
        if (!config.useSessionStorage) return false;
        
        try {
            if (onlyAppItems) {
                // Only clear items with our prefix
                Object.keys(sessionStorage).forEach(key => {
                    if (key.startsWith(config.prefix)) {
                        sessionStorage.removeItem(key);
                    }
                });
            } else {
                // Clear all session storage
                sessionStorage.clear();
            }
            return true;
        } catch (e) {
            console.error('Error clearing sessionStorage:', e);
            return false;
        }
    };
    
    // IndexedDB operations
    let db = null;
    
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            if (!config.useIndexedDB) {
                reject(new Error('IndexedDB is not available'));
                return;
            }
            
            if (db) {
                resolve(db);
                return;
            }
            
            const request = indexedDB.open(config.dbName, config.dbVersion);
            
            request.onerror = (event) => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('messages')) {
                    db.createObjectStore('messages', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('user_data')) {
                    db.createObjectStore('user_data', { keyPath: 'key' });
                }
                
                if (!db.objectStoreNames.contains('app_settings')) {
                    db.createObjectStore('app_settings', { keyPath: 'key' });
                }
            };
        });
    };
    
    const indexedDBSet = async (storeName, key, value) => {
        try {
            const database = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                let request;
                if (typeof key === 'object' && key !== null) {
                    // If key is an object with an 'id' field, use it directly
                    request = store.put(key);
                } else {
                    // Otherwise, create an object with key and value
                    request = store.put({ key, value, timestamp: Date.now() });
                }
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => {
                    console.error('Error storing data in IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error('Error in indexedDBSet:', e);
            return false;
        }
    };
    
    const indexedDBGet = async (storeName, key) => {
        try {
            const database = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);
                
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    if (result && typeof result === 'object' && 'value' in result) {
                        resolve(result.value);
                    } else {
                        resolve(result);
                    }
                };
                
                request.onerror = (event) => {
                    console.error('Error retrieving data from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error('Error in indexedDBGet:', e);
            return null;
        }
    };
    
    const indexedDBGetAll = async (storeName) => {
        try {
            const database = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    console.error('Error retrieving all data from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error('Error in indexedDBGetAll:', e);
            return [];
        }
    };
    
    const indexedDBRemove = async (storeName, key) => {
        try {
            const database = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => {
                    console.error('Error removing data from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error('Error in indexedDBRemove:', e);
            return false;
        }
    };
    
    const indexedDBClear = async (storeName) => {
        try {
            const database = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => {
                    console.error('Error clearing data from IndexedDB:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error('Error in indexedDBClear:', e);
            return false;
        }
    };
    
    // Message-specific operations
    const saveMessage = async (message) => {
        // First try IndexedDB
        if (config.useIndexedDB) {
            try {
                return await indexedDBSet('messages', message);
            } catch (e) {
                console.error('Failed to save message to IndexedDB, falling back to localStorage');
            }
        }
        
        // Fall back to localStorage
        if (config.useLocalStorage) {
            const messages = localStorageGet('messages') || [];
            
            // Update existing message or add new one
            const existingIndex = messages.findIndex(m => m.id === message.id);
            if (existingIndex >= 0) {
                messages[existingIndex] = message;
            } else {
                messages.push(message);
            }
            
            return localStorageSet('messages', messages);
        }
        
        return false;
    };
    
    const getMessage = async (messageId) => {
        // First try IndexedDB
        if (config.useIndexedDB) {
            try {
                const message = await indexedDBGet('messages', messageId);
                if (message) return message;
            } catch (e) {
                console.error('Failed to get message from IndexedDB, falling back to localStorage');
            }
        }
        
        // Fall back to localStorage
        if (config.useLocalStorage) {
            const messages = localStorageGet('messages') || [];
            return messages.find(m => m.id === messageId) || null;
        }
        
        return null;
    };
    
    const getAllMessages = async () => {
        // First try IndexedDB
        if (config.useIndexedDB) {
            try {
                return await indexedDBGetAll('messages');
            } catch (e) {
                console.error('Failed to get all messages from IndexedDB, falling back to localStorage');
            }
        }
        
        // Fall back to localStorage
        if (config.useLocalStorage) {
            return localStorageGet('messages') || [];
        }
        
        return [];
    };
    
    const deleteMessage = async (messageId) => {
        // First try IndexedDB
        if (config.useIndexedDB) {
            try {
                return await indexedDBRemove('messages', messageId);
            } catch (e) {
                console.error('Failed to delete message from IndexedDB, falling back to localStorage');
            }
        }
        
        // Fall back to localStorage
        if (config.useLocalStorage) {
            const messages = localStorageGet('messages') || [];
            const updatedMessages = messages.filter(m => m.id !== messageId);
            
            if (messages.length !== updatedMessages.length) {
                return localStorageSet('messages', updatedMessages);
            }
        }
        
        return false;
    };
    
    // Generic storage interfaces (automatically choose best available storage)
    const set = (key, value, options = {}) => {
        const { permanent = true, expiry = config.defaultExpiry } = options;
        
        if (permanent) {
            // Try to use IndexedDB for persistent data
            if (config.useIndexedDB) {
                return indexedDBSet('app_settings', key, value)
                    .catch(() => {
                        // Fall back to localStorage if IndexedDB fails
                        return localStorageSet(key, value, expiry);
                    });
            }
            
            // Fall back to localStorage if IndexedDB not available
            return localStorageSet(key, value, expiry);
        } else {
            // Use session storage for non-permanent data
            return sessionStorageSet(key, value);
        }
    };
    
    const get = async (key, options = {}) => {
        const { permanent = true } = options;
        
        if (permanent) {
            // Try IndexedDB first for persistent data
            if (config.useIndexedDB) {
                try {
                    const value = await indexedDBGet('app_settings', key);
                    if (value !== null && value !== undefined) {
                        return value;
                    }
                } catch (e) {
                    console.error('Error retrieving from IndexedDB, falling back to localStorage');
                }
            }
            
            // Fall back to localStorage
            return localStorageGet(key);
        } else {
            // Use session storage for non-permanent data
            return sessionStorageGet(key);
        }
    };
    
    const remove = (key, options = {}) => {
        const { permanent = true } = options;
        
        if (permanent) {
            let promises = [];
            
            if (config.useIndexedDB) {
                promises.push(indexedDBRemove('app_settings', key));
            }
            
            if (config.useLocalStorage) {
                promises.push(Promise.resolve(localStorageRemove(key)));
            }
            
            return Promise.all(promises)
                .then(() => true)
                .catch(e => {
                    console.error('Error removing item:', e);
                    return false;
                });
        } else {
            return Promise.resolve(sessionStorageRemove(key));
        }
    };
    
    // Clear all app data
    const clearAll = async () => {
        let promises = [];
        
        if (config.useIndexedDB) {
            promises.push(indexedDBClear('messages'));
            promises.push(indexedDBClear('user_data'));
            promises.push(indexedDBClear('app_settings'));
        }
        
        if (config.useLocalStorage) {
            promises.push(Promise.resolve(localStorageClear()));
        }
        
        if (config.useSessionStorage) {
            promises.push(Promise.resolve(sessionStorageClear()));
        }
        
        return Promise.all(promises)
            .then(() => true)
            .catch(e => {
                console.error('Error clearing all storage:', e);
                return false;
            });
    };
    
    // User data specific methods
    const saveUserData = (data) => {
        return set('user_data', data, { permanent: true });
    };
    
    const getUserData = () => {
        return get('user_data', { permanent: true });
    };
    
    const clearUserData = () => {
        return remove('user_data', { permanent: true });
    };
    
    // App settings specific methods
    const saveSettings = (settings) => {
        return set('app_settings', settings, { permanent: true });
    };
    
    const getSettings = () => {
        return get('app_settings', { permanent: true });
    };
    
    // Public API
    return {
        // Configuration
        getConfig: () => ({ ...config }),
        
        // Generic storage
        set,
        get,
        remove,
        clearAll,
        
        // Local storage
        localStorageSet,
        localStorageGet,
        localStorageRemove,
        localStorageClear,
        
        // Session storage
        sessionStorageSet,
        sessionStorageGet,
        sessionStorageRemove,
        sessionStorageClear,
        
        // IndexedDB
        indexedDBSet,
        indexedDBGet,
        indexedDBGetAll,
        indexedDBRemove,
        indexedDBClear,
        
        // Message operations
        saveMessage,
        getMessage,
        getAllMessages,
        deleteMessage,
        
        // User data
        saveUserData,
        getUserData,
        clearUserData,
        
        // App settings
        saveSettings,
        getSettings
    };
})();

/**
 * Storage utilities for UnwrapLater
 * Handles saving and retrieving capsules from storage
 */
const StorageUtil = (() => {
    // Storage keys
    const KEYS = {
        CAPSULES: 'unwraplater_capsules',
        MEDIA: 'unwraplater_media',
        PREFERENCES: 'unwraplater_preferences'
    };
    
    /**
     * Check if storage is available
     * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
     * @returns {boolean} - Whether storage is available
     */
    const isStorageAvailable = (type) => {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, testKey);
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };
    
    // Check if localStorage is available
    const hasLocalStorage = isStorageAvailable('localStorage');
    
    /**
     * Save data to storage
     * @param {string} key - Storage key
     * @param {*} data - Data to save (will be JSON.stringified)
     * @returns {boolean} - Whether save was successful
     */
    const saveData = (key, data) => {
        if (!hasLocalStorage) {
            console.error('localStorage is not available');
            return false;
        }
        
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    };
    
    /**
     * Get data from storage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} - Retrieved data or default value
     */
    const getData = (key, defaultValue = null) => {
        if (!hasLocalStorage) {
            console.error('localStorage is not available');
            return defaultValue;
        }
        
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    };
    
    /**
     * Save a capsule
     * @param {Object} capsule - Capsule object to save
     * @returns {boolean} - Whether save was successful
     */
    const saveCapsule = (capsule) => {
        if (!capsule || !capsule.id) {
            console.error('Invalid capsule object');
            return false;
        }
        
        const capsules = getData(KEYS.CAPSULES, {});
        capsules[capsule.id] = capsule;
        
        return saveData(KEYS.CAPSULES, capsules);
    };
    
    /**
     * Get a capsule by ID
     * @param {string} id - Capsule ID
     * @returns {Object|null} - Capsule object or null if not found
     */
    const getCapsule = (id) => {
        const capsules = getData(KEYS.CAPSULES, {});
        return capsules[id] || null;
    };
    
    /**
     * Get all capsules
     * @returns {Object} - Object containing all capsules with IDs as keys
     */
    const getAllCapsules = () => {
        return getData(KEYS.CAPSULES, {});
    };
    
    /**
     * Delete a capsule
     * @param {string} id - Capsule ID to delete
     * @returns {boolean} - Whether delete was successful
     */
    const deleteCapsule = (id) => {
        const capsules = getData(KEYS.CAPSULES, {});
        
        if (!capsules[id]) {
            return false;
        }
        
        delete capsules[id];
        
        // Also delete associated media
        deleteMedia(id);
        
        return saveData(KEYS.CAPSULES, capsules);
    };
    
    /**
     * Save media for a capsule
     * @param {string} capsuleId - Capsule ID
     * @param {Object} mediaData - Media data object
     * @returns {boolean} - Whether save was successful
     */
    const saveMedia = (capsuleId, mediaData) => {
        if (!capsuleId || !mediaData) {
            console.error('Invalid media data');
            return false;
        }
        
        const media = getData(KEYS.MEDIA, {});
        media[capsuleId] = mediaData;
        
        return saveData(KEYS.MEDIA, media);
    };
    
    /**
     * Get media for a capsule
     * @param {string} capsuleId - Capsule ID
     * @returns {Object|null} - Media data or null if not found
     */
    const getMedia = (capsuleId) => {
        const media = getData(KEYS.MEDIA, {});
        return media[capsuleId] || null;
    };
    
    /**
     * Delete media for a capsule
     * @param {string} capsuleId - Capsule ID
     * @returns {boolean} - Whether delete was successful
     */
    const deleteMedia = (capsuleId) => {
        const media = getData(KEYS.MEDIA, {});
        
        if (!media[capsuleId]) {
            return false;
        }
        
        delete media[capsuleId];
        return saveData(KEYS.MEDIA, media);
    };
    
    /**
     * Save user preferences
     * @param {Object} preferences - Preferences object
     * @returns {boolean} - Whether save was successful
     */
    const savePreferences = (preferences) => {
        return saveData(KEYS.PREFERENCES, preferences);
    };
    
    /**
     * Get user preferences
     * @returns {Object} - Preferences object
     */
    const getPreferences = () => {
        return getData(KEYS.PREFERENCES, {});
    };
    
    /**
     * Clear all storage data
     * @returns {boolean} - Whether clear was successful
     */
    const clearAllData = () => {
        if (!hasLocalStorage) {
            return false;
        }
        
        try {
            localStorage.removeItem(KEYS.CAPSULES);
            localStorage.removeItem(KEYS.MEDIA);
            localStorage.removeItem(KEYS.PREFERENCES);
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    };
    
    // Public API
    return {
        saveCapsule,
        getCapsule,
        getAllCapsules,
        deleteCapsule,
        saveMedia,
        getMedia,
        deleteMedia,
        savePreferences,
        getPreferences,
        clearAllData,
        hasLocalStorage,
        KEYS
    };
})();
