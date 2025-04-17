/**
 * API Service
 * Handles API communication for the UnwrapLater app
 */
const ApiService = (() => {
    // Base URL for API requests - replace with actual API URL when available
    const API_BASE_URL = 'https://api.unwraplater.com/v1';
    
    // API endpoints
    const ENDPOINTS = {
        MESSAGES: '/messages',
        USER: '/user',
        AUTH: '/auth'
    };

    // Request timeout in milliseconds
    const REQUEST_TIMEOUT = 30000;

    // Store the auth token
    let authToken = null;

    /**
     * Set the authentication token
     * @param {string} token - JWT token
     */
    const setAuthToken = (token) => {
        authToken = token;
        // Optionally store in sessionStorage for persistence during page refreshes
        if (token) {
            sessionStorage.setItem('auth_token', token);
        } else {
            sessionStorage.removeItem('auth_token');
        }
    };

    /**
     * Get the stored authentication token
     * @returns {string|null} The auth token or null
     */
    const getAuthToken = () => {
        if (!authToken) {
            // Try to get from session storage
            authToken = sessionStorage.getItem('auth_token');
        }
        return authToken;
    };

    /**
     * Create headers for API requests
     * @param {boolean} includeAuth - Whether to include auth token
     * @returns {Object} Headers object
     */
    const createHeaders = (includeAuth = true) => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    };

    /**
     * Make an API request with timeout
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} Promise resolving to response data
     */
    const fetchWithTimeout = async (url, options = {}) => {
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set timeout to abort request
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        try {
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeout);
            
            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    message: errorData.message || 'API request failed',
                    details: errorData
                };
            }
            
            // Return JSON response or empty object if no content
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            clearTimeout(timeout);
            
            // Handle timeout errors
            if (error.name === 'AbortError') {
                throw { message: 'Request timeout', status: 408 };
            }
            
            throw error;
        }
    };

    /**
     * GET request wrapper
     * @param {string} endpoint - API endpoint
     * @param {Object} params - URL parameters
     * @param {boolean} requiresAuth - Whether the request needs authentication
     * @returns {Promise} Promise resolving to response data
     */
    const get = async (endpoint, params = {}, requiresAuth = true) => {
        // Build URL with query parameters
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        return fetchWithTimeout(url.toString(), {
            method: 'GET',
            headers: createHeaders(requiresAuth)
        });
    };

    /**
     * POST request wrapper
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request payload
     * @param {boolean} requiresAuth - Whether the request needs authentication
     * @returns {Promise} Promise resolving to response data
     */
    const post = async (endpoint, data = {}, requiresAuth = true) => {
        return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: createHeaders(requiresAuth),
            body: JSON.stringify(data)
        });
    };

    /**
     * PUT request wrapper
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request payload
     * @param {boolean} requiresAuth - Whether the request needs authentication
     * @returns {Promise} Promise resolving to response data
     */
    const put = async (endpoint, data = {}, requiresAuth = true) => {
        return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: createHeaders(requiresAuth),
            body: JSON.stringify(data)
        });
    };

    /**
     * DELETE request wrapper
     * @param {string} endpoint - API endpoint
     * @param {boolean} requiresAuth - Whether the request needs authentication
     * @returns {Promise} Promise resolving to response data
     */
    const del = async (endpoint, requiresAuth = true) => {
        return fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: createHeaders(requiresAuth)
        });
    };

    /**
     * User login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Promise resolving to user data with token
     */
    const login = async (email, password) => {
        try {
            const response = await post(ENDPOINTS.AUTH + '/login', { email, password }, false);
            if (response && response.token) {
                setAuthToken(response.token);
            }
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    /**
     * User logout
     * @returns {Promise} Promise resolving when logout is complete
     */
    const logout = async () => {
        try {
            // Optional: inform the server about logout
            await post(ENDPOINTS.AUTH + '/logout');
        } catch (error) {
            console.warn('Logout notification failed:', error);
            // Continue with local logout even if server notification fails
        } finally {
            // Clear token locally
            setAuthToken(null);
        }
    };

    /**
     * Get messages from API
     * @param {Object} filters - Optional filter parameters
     * @returns {Promise} Promise resolving to messages data
     */
    const getMessages = async (filters = {}) => {
        return get(ENDPOINTS.MESSAGES, filters);
    };

    /**
     * Create a new message
     * @param {Object} messageData - Message data
     * @returns {Promise} Promise resolving to created message
     */
    const createMessage = async (messageData) => {
        return post(ENDPOINTS.MESSAGES, messageData);
    };

    /**
     * Update an existing message
     * @param {string} messageId - ID of message to update
     * @param {Object} messageData - Updated message data
     * @returns {Promise} Promise resolving to updated message
     */
    const updateMessage = async (messageId, messageData) => {
        return put(`${ENDPOINTS.MESSAGES}/${messageId}`, messageData);
    };

    /**
     * Delete a message
     * @param {string} messageId - ID of message to delete
     * @returns {Promise} Promise resolving when deletion is complete
     */
    const deleteMessage = async (messageId) => {
        return del(`${ENDPOINTS.MESSAGES}/${messageId}`);
    };

    /**
     * Get user profile
     * @returns {Promise} Promise resolving to user profile data
     */
    const getUserProfile = async () => {
        return get(ENDPOINTS.USER + '/profile');
    };

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise} Promise resolving to updated profile
     */
    const updateUserProfile = async (profileData) => {
        return put(ENDPOINTS.USER + '/profile', profileData);
    };

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Promise resolving to new user data
     */
    const register = async (userData) => {
        return post(ENDPOINTS.AUTH + '/register', userData, false);
    };

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise} Promise resolving when request is sent
     */
    const requestPasswordReset = async (email) => {
        return post(ENDPOINTS.AUTH + '/reset-password', { email }, false);
    };

    /**
     * Complete password reset
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} Promise resolving when password is reset
     */
    const resetPassword = async (token, newPassword) => {
        return post(ENDPOINTS.AUTH + '/reset-password/confirm', {
            token,
            newPassword
        }, false);
    };

    // Public API
    return {
        // Auth methods
        login,
        logout,
        register,
        getAuthToken,
        setAuthToken,
        requestPasswordReset,
        resetPassword,
        
        // Message methods
        getMessages,
        createMessage,
        updateMessage,
        deleteMessage,
        
        // User methods
        getUserProfile,
        updateUserProfile,
        
        // HTTP methods (for custom endpoints)
        get,
        post,
        put,
        del
    };
})(); 