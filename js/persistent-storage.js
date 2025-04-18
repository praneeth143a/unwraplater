/**
 * Persistent Storage Module for UnwrapLater
 * Ensures capsules are always accessible through their links
 */
const PersistentCapsuleStorage = (() => {
    // Constants
    const URL_DATA_PARAM = 'data';
    const CAPSULE_ID_PARAM = 'capsule';
    
    /**
     * Extract capsule data from URL if available
     * @returns {Object|null} Capsule data object or null if not found
     */
    const getCapsuleDataFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        
        // First check for encoded data parameter
        const encodedData = urlParams.get(URL_DATA_PARAM);
        if (encodedData) {
            try {
                // Decode the base64 data
                const decodedData = decodeURIComponent(atob(encodedData));
                return JSON.parse(decodedData);
            } catch (error) {
                console.error('Error decoding capsule data from URL:', error);
                return null;
            }
        }
        
        // Check for regular capsule ID parameter
        const capsuleId = urlParams.get(CAPSULE_ID_PARAM);
        if (capsuleId) {
            return { id: capsuleId };
        }
        
        return null;
    };
    
    /**
     * Get capsule data, prioritizing local storage but falling back to URL data if needed
     * @param {string} capsuleId - The ID of the capsule to retrieve
     * @returns {Object|null} Capsule data or null if not found
     */
    const getCapsule = (capsuleId) => {
        // First try to get from local storage
        const storedCapsule = StorageUtil.getCapsule(capsuleId);
        if (storedCapsule) {
            return storedCapsule;
        }
        
        // If not in local storage, try to get from URL
        const urlCapsuleData = getCapsuleDataFromURL();
        if (urlCapsuleData && (urlCapsuleData.id === capsuleId || !urlCapsuleData.id)) {
            // If URL data doesn't have an ID or matches the requested ID, use it
            if (!urlCapsuleData.id) {
                urlCapsuleData.id = capsuleId;
            }
            
            // Save to local storage for future access
            StorageUtil.saveCapsule(urlCapsuleData);
            console.log('Recovered capsule data from URL and saved to local storage');
            
            return urlCapsuleData;
        }
        
        return null;
    };
    
    /**
     * Ensure capsule is stored locally for future access
     * @param {Object} capsuleData - Capsule data from URL or other source
     */
    const persistCapsuleData = (capsuleData) => {
        if (!capsuleData || !capsuleData.id) return;
        
        // Check if already exists
        const existing = StorageUtil.getCapsule(capsuleData.id);
        if (!existing) {
            StorageUtil.saveCapsule(capsuleData);
            console.log(`Capsule ${capsuleData.id} saved to local storage for future access`);
            
            // If capsule has media, store that too
            if (capsuleData.media && capsuleData.mediaType) {
                StorageUtil.saveMedia(capsuleData.id, {
                    type: capsuleData.mediaType,
                    data: capsuleData.media,
                    name: capsuleData.mediaName || 'Attached Media'
                });
                console.log(`Media for capsule ${capsuleData.id} saved to local storage`);
            }
        }
    };
    
    /**
     * Check if the current URL contains a valid capsule
     * @returns {boolean} True if URL contains valid capsule data
     */
    const hasValidCapsuleInURL = () => {
        return getCapsuleDataFromURL() !== null;
    };
    
    /**
     * Initialize by checking for capsule in URL and persisting if found
     */
    const initialize = () => {
        const urlCapsuleData = getCapsuleDataFromURL();
        if (urlCapsuleData) {
            persistCapsuleData(urlCapsuleData);
        }
    };
    
    // Public API
    return {
        initialize,
        getCapsule,
        persistCapsuleData,
        hasValidCapsuleInURL,
        getCapsuleDataFromURL
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    PersistentCapsuleStorage.initialize();
}); 