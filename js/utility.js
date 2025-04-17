/**
 * Utility
 * Common utility functions for the UnwrapLater app
 */
const Utility = (() => {
    /**
     * Format a date in a user-friendly way
     * @param {Date|number|string} date - Date to format
     * @param {boolean} includeTime - Whether to include time in the output
     * @returns {string} Formatted date string
     */
    const formatDate = (date, includeTime = true) => {
        if (!date) return 'Invalid date';
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return dateObj.toLocaleDateString(undefined, options);
    };

    /**
     * Calculate time remaining until a future date
     * @param {Date|number|string} futureDate - Future date to calculate time until
     * @returns {Object} Object containing remaining time parts and display string
     */
    const timeRemaining = (futureDate) => {
        const now = new Date();
        const future = new Date(futureDate);
        const diffMs = future - now;
        
        // If the date is in the past
        if (diffMs <= 0) {
            return {
                expired: true,
                display: 'Ready to open!'
            };
        }
        
        // Calculate remaining time components
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        // Build display string
        let display = '';
        if (days > 0) display += `${days}d `;
        if (days > 0 || hours > 0) display += `${hours}h `;
        if (days === 0 && hours === 0) display += `${minutes}m ${seconds}s`;
        else display += `${minutes}m`;
        
        return {
            days,
            hours,
            minutes,
            seconds,
            total: diffMs,
            expired: false,
            display: display.trim()
        };
    };

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    /**
     * Format bytes to a human-readable size
     * @param {number} bytes - Bytes to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted size string
     */
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    };

    /**
     * Validate email address format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether the email is valid
     */
    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait = 300) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Whether the copy was successful
     */
    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            return false;
        }
    };

    // Public API
    return {
        formatDate,
        timeRemaining,
        generateId,
        formatBytes,
        isValidEmail,
        debounce,
        copyToClipboard
    };
})(); 