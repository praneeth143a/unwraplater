/**
 * API Client Service
 * Handles HTTP requests for the UnwrapLater app
 */
const ApiClient = (() => {
    // Default configuration
    const config = {
        baseUrl: '', // Base URL for API requests
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 30000, // Default timeout in milliseconds
        retryCount: 3, // Number of retries for failed requests
        retryDelay: 1000, // Delay between retries in milliseconds
        cacheEnabled: true, // Whether to cache GET requests
        cacheTTL: 300000, // Cache TTL in milliseconds (5 minutes)
        responseType: 'json', // Default response type
        withCredentials: false // Whether to include credentials in cross-origin requests
    };
    
    // Cache storage
    const cache = new Map();
    
    // Currently pending requests (used for deduplication)
    const pendingRequests = new Map();
    
    // Set configuration
    const setConfig = (newConfig) => {
        Object.assign(config, newConfig);
    };
    
    // Generate cache key
    const generateCacheKey = (url, params = {}) => {
        const queryString = Object.keys(params)
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
            
        return `${url}${queryString ? `?${queryString}` : ''}`;
    };
    
    // Check if cache entry is valid
    const isCacheValid = (cacheEntry) => {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < config.cacheTTL;
    };
    
    // Set cache entry
    const setCacheEntry = (key, data) => {
        if (!config.cacheEnabled) return;
        
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    };
    
    // Get cache entry
    const getCacheEntry = (key) => {
        const cacheEntry = cache.get(key);
        
        if (isCacheValid(cacheEntry)) {
            return cacheEntry.data;
        }
        
        // Remove expired cache entry
        cache.delete(key);
        return null;
    };
    
    // Clear cache
    const clearCache = () => {
        cache.clear();
    };
    
    // Parse response
    const parseResponse = async (response, responseType) => {
        switch (responseType.toLowerCase()) {
            case 'json':
                return await response.json();
            case 'text':
                return await response.text();
            case 'blob':
                return await response.blob();
            case 'arraybuffer':
                return await response.arrayBuffer();
            default:
                return await response.json();
        }
    };
    
    // Make HTTP request
    const request = async (url, options = {}) => {
        const {
            method = 'GET',
            headers = {},
            data = null,
            params = {},
            responseType = config.responseType,
            timeout = config.timeout,
            retryCount = config.retryCount,
            retryDelay = config.retryDelay,
            useCache = config.cacheEnabled && method.toUpperCase() === 'GET',
            withCredentials = config.withCredentials,
            signal = null
        } = options;
        
        // Build full URL
        let fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
        
        // Add query parameters
        if (Object.keys(params).length > 0) {
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
                
            fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
        }
        
        // Check cache
        if (useCache) {
            const cacheKey = generateCacheKey(fullUrl, {});
            const cachedData = getCacheEntry(cacheKey);
            
            if (cachedData) {
                return cachedData;
            }
            
            // Check if the same request is already in progress
            if (pendingRequests.has(cacheKey)) {
                return pendingRequests.get(cacheKey);
            }
        }
        
        // Prepare request options
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: { ...config.defaultHeaders, ...headers },
            signal: signal || (timeout ? AbortSignal.timeout(timeout) : null),
            credentials: withCredentials ? 'include' : 'same-origin'
        };
        
        // Add request body
        if (data !== null) {
            if (data instanceof FormData) {
                fetchOptions.body = data;
                // Let the browser set the correct Content-Type with boundary
                delete fetchOptions.headers['Content-Type'];
            } else if (typeof data === 'object') {
                fetchOptions.body = JSON.stringify(data);
            } else {
                fetchOptions.body = data;
            }
        }
        
        // Create request function for retries
        const makeRequest = async (retries) => {
            try {
                const response = await fetch(fullUrl, fetchOptions);
                
                // Check if response is OK (status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
                }
                
                // Parse response
                const responseData = await parseResponse(response, responseType);
                
                // Cache successful GET responses
                if (useCache) {
                    const cacheKey = generateCacheKey(fullUrl, {});
                    setCacheEntry(cacheKey, responseData);
                }
                
                return responseData;
            } catch (error) {
                // Retry on network errors or 5xx server errors
                if (retries > 0 && (error.name === 'AbortError' || (error.message && error.message.includes('HTTP Error 5')))) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return makeRequest(retries - 1);
                }
                
                throw error;
            }
        };
        
        try {
            const requestPromise = makeRequest(retryCount);
            
            // Store the pending request
            if (useCache) {
                const cacheKey = generateCacheKey(fullUrl, {});
                pendingRequests.set(cacheKey, requestPromise);
            }
            
            const result = await requestPromise;
            
            // Remove from pending requests
            if (useCache) {
                const cacheKey = generateCacheKey(fullUrl, {});
                pendingRequests.delete(cacheKey);
            }
            
            return result;
        } catch (error) {
            // Remove from pending requests
            if (useCache) {
                const cacheKey = generateCacheKey(fullUrl, {});
                pendingRequests.delete(cacheKey);
            }
            
            throw error;
        }
    };
    
    // HTTP method shortcuts
    const get = (url, options = {}) => {
        return request(url, { ...options, method: 'GET' });
    };
    
    const post = (url, data = null, options = {}) => {
        return request(url, { ...options, method: 'POST', data });
    };
    
    const put = (url, data = null, options = {}) => {
        return request(url, { ...options, method: 'PUT', data });
    };
    
    const patch = (url, data = null, options = {}) => {
        return request(url, { ...options, method: 'PATCH', data });
    };
    
    const del = (url, options = {}) => {
        return request(url, { ...options, method: 'DELETE' });
    };
    
    // Upload file with progress tracking
    const uploadFile = (url, file, options = {}) => {
        const {
            headers = {},
            onProgress = null,
            fieldName = 'file',
            extraData = {},
            method = 'POST'
        } = options;
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            
            // Add file to form data
            formData.append(fieldName, file);
            
            // Add extra form data
            Object.keys(extraData).forEach(key => {
                formData.append(key, extraData[key]);
            });
            
            // Track upload progress
            if (onProgress && typeof onProgress === 'function') {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete, event);
                    }
                });
            }
            
            // Handle response
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let response;
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response = xhr.responseText;
                    }
                    resolve(response);
                } else {
                    reject(new Error(`HTTP Error ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            // Handle error
            xhr.onerror = () => {
                reject(new Error('Network Error'));
            };
            
            // Handle timeout
            xhr.ontimeout = () => {
                reject(new Error('Request Timeout'));
            };
            
            // Open connection
            const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
            xhr.open(method, fullUrl, true);
            
            // Set headers
            Object.keys(config.defaultHeaders).forEach(key => {
                if (key !== 'Content-Type') { // Skip Content-Type, let FormData set it
                    xhr.setRequestHeader(key, config.defaultHeaders[key]);
                }
            });
            
            Object.keys(headers).forEach(key => {
                if (key !== 'Content-Type') { // Skip Content-Type, let FormData set it
                    xhr.setRequestHeader(key, headers[key]);
                }
            });
            
            // Set timeout
            xhr.timeout = options.timeout || config.timeout;
            
            // Send request
            xhr.send(formData);
        });
    };
    
    // Download file
    const downloadFile = async (url, filename, options = {}) => {
        const {
            method = 'GET',
            headers = {},
            data = null,
            timeout = config.timeout,
            onProgress = null
        } = options;
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Track download progress
            if (onProgress && typeof onProgress === 'function') {
                xhr.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete, event);
                    }
                });
            }
            
            // Handle response
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Create blob from response
                    const blob = new Blob([xhr.response]);
                    
                    // Create object URL
                    const url = URL.createObjectURL(blob);
                    
                    // Create temporary link element to trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.style.display = 'none';
                    
                    // Add link to document and trigger click
                    document.body.appendChild(link);
                    link.click();
                    
                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 100);
                    
                    resolve(true);
                } else {
                    reject(new Error(`HTTP Error ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            // Handle error
            xhr.onerror = () => {
                reject(new Error('Network Error'));
            };
            
            // Handle timeout
            xhr.ontimeout = () => {
                reject(new Error('Request Timeout'));
            };
            
            // Open connection
            const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
            xhr.open(method, fullUrl, true);
            
            // Set headers
            Object.keys(config.defaultHeaders).forEach(key => {
                xhr.setRequestHeader(key, config.defaultHeaders[key]);
            });
            
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            
            // Set response type to blob
            xhr.responseType = 'blob';
            
            // Set timeout
            xhr.timeout = timeout;
            
            // Send request
            if (data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    };
    
    // Public API
    return {
        setConfig,
        request,
        get,
        post,
        put,
        patch,
        delete: del,
        uploadFile,
        downloadFile,
        clearCache,
        getConfig: () => ({ ...config })
    };
})(); 