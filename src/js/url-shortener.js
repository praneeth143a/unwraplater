/**
 * URLShortener - Utilities for generating and resolving short URLs
 * for UnwrapLater time capsules
 */

const URLShortener = (function() {
    // Storage key prefix for localStorage
    const STORAGE_PREFIX = 'unwraplater_capsule_';
    
    // Characters used for generating short IDs (alphanumeric minus ambiguous chars)
    const ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
    
    // Default ID length
    const DEFAULT_ID_LENGTH = 6;
    
    /**
     * Generate a random short ID for a capsule
     * @param {number} length - Length of ID to generate
     * @returns {string} - Random short ID
     */
    function generateShortId(length = DEFAULT_ID_LENGTH) {
        let id = '';
        for (let i = 0; i < length; i++) {
            id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
        }
        
        // Check if ID already exists in localStorage
        if (localStorage.getItem(STORAGE_PREFIX + id)) {
            // Collision found, generate a new ID (recursively)
            return generateShortId(length);
        }
        
        return id;
    }
    
    /**
     * Store capsule data with a short ID
     * @param {string} capsuleData - Base64 encoded capsule data
     * @returns {string} - Generated short ID
     */
    function storeCapsuleData(capsuleData) {
        const shortId = generateShortId();
        
        try {
            // Store the capsule data in localStorage
            localStorage.setItem(STORAGE_PREFIX + shortId, capsuleData);
            return shortId;
        } catch (error) {
            console.error('Failed to store capsule data:', error);
            
            // If localStorage fails (e.g., quota exceeded), 
            // we can fallback to just using the original base64 data
            return null;
        }
    }
    
    /**
     * Retrieve capsule data from a short ID
     * @param {string} shortId - Short ID for the capsule
     * @returns {string|null} - Capsule data if found, null otherwise
     */
    function getCapsuleData(shortId) {
        return localStorage.getItem(STORAGE_PREFIX + shortId);
    }
    
    /**
     * Generate a short URL for a capsule
     * @param {string} capsuleData - Base64 encoded capsule data
     * @param {boolean} useExternalService - Whether to use an external shortening service
     * @returns {Promise<string>} - Short URL for the capsule
     */
    async function generateShortUrl(capsuleData, useExternalService = false) {
        if (useExternalService) {
            return await shortenWithExternalService(capsuleData);
        }
        
        // Use internal shortening
        const shortId = storeCapsuleData(capsuleData);
        
        if (shortId) {
            // Build the short URL
            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?id=${shortId}`;
        } else {
            // Fallback to original URL with hash
            return window.location.href.split('#')[0] + '#' + capsuleData;
        }
    }
    
    /**
     * Short URL with external service like Bitly (if available)
     * @param {string} capsuleData - Base64 encoded capsule data 
     * @returns {Promise<string>} - Shortened URL
     */
    async function shortenWithExternalService(capsuleData) {
        try {
            // Store data locally first for redundancy
            const shortId = storeCapsuleData(capsuleData);
            const longUrl = window.location.href.split('#')[0] + '#' + capsuleData;
            
            // Check if API key is available (you would need to set this)
            const apiKey = getExternalServiceApiKey();
            
            if (!apiKey) {
                throw new Error("No API key available for external URL shortening");
            }
            
            // Example using Bitly API (you would need to replace with your actual implementation)
            const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    long_url: longUrl
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to shorten URL with external service');
            }
            
            const data = await response.json();
            return data.link;
        } catch (error) {
            console.error('External URL shortening failed:', error);
            
            // Fallback to internal shortening
            return generateShortUrl(capsuleData, false);
        }
    }
    
    /**
     * Get API key for external URL shortening service
     * In a real implementation, you might store this in a config file or get it from the server
     * @returns {string|null} - API key if available
     */
    function getExternalServiceApiKey() {
        // This is a placeholder - you would implement this based on your setup
        return null; // Return null to indicate no API key is available
    }
    
    /**
     * Parse the current URL to extract capsule data or short ID
     * @returns {string|null} - Capsule data if found
     */
    function parseCurrentUrl() {
        // Check if URL has a short ID parameter
        const urlParams = new URLSearchParams(window.location.search);
        const shortId = urlParams.get('id');
        
        if (shortId) {
            // Retrieve capsule data from localStorage
            const capsuleData = getCapsuleData(shortId);
            if (capsuleData) {
                return capsuleData;
            }
        }
        
        // Check if URL has a hash fragment (original method)
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            return hash.substring(1);
        }
        
        return null;
    }
    
    /**
     * Check if the URL has expired from localStorage
     * This helps prevent localStorage from filling up
     * @param {number} days - Number of days to keep data
     */
    function cleanupExpiredCapsules(days = 30) {
        const now = Date.now();
        const expiryTime = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        
        // Iterate all localStorage items
        Object.keys(localStorage).forEach(key => {
            // Only check our capsule items
            if (key.startsWith(STORAGE_PREFIX)) {
                try {
                    const capsuleData = localStorage.getItem(key);
                    // Try to decode and check creation time
                    const decodedData = JSON.parse(decodeURIComponent(atob(capsuleData)));
                    
                    if (decodedData.createdAt && (now - decodedData.createdAt > expiryTime)) {
                        // Capsule is older than the expiry time, remove it
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // If we can't parse the data, leave it alone
                    console.warn('Could not parse capsule data for cleanup:', key);
                }
            }
        });
    }
    
    // Expose public methods
    return {
        generateShortUrl,
        parseCurrentUrl,
        cleanupExpiredCapsules
    };
})();

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLShortener;
} 