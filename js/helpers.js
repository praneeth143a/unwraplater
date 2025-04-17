/**
 * Helpers and Utilities
 * Common utility functions for the UnwrapLater app
 */
const Helpers = (() => {
    /**
     * Format a date with various options
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date string
     */
    const formatDate = (date, options = {}) => {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Default format options
        const defaultOptions = {
            format: 'full', // 'full', 'date', 'time', 'relative', 'calendar'
            includeTime: true,
            locale: navigator.language || 'en-US'
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // Return 'Invalid Date' if the date is invalid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }
        
        // Format based on specified format
        switch (settings.format) {
            case 'relative':
                return formatRelativeTime(dateObj);
                
            case 'calendar':
                return formatCalendarDate(dateObj);
                
            case 'time':
                return dateObj.toLocaleTimeString(settings.locale, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
            case 'date':
                return dateObj.toLocaleDateString(settings.locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
            case 'full':
            default:
                if (settings.includeTime) {
                    return dateObj.toLocaleString(settings.locale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else {
                    return dateObj.toLocaleDateString(settings.locale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
        }
    };
    
    /**
     * Format a date relative to now (e.g., "5 minutes ago")
     * @param {Date} date - Date to format
     * @returns {string} Relative time string
     */
    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // Future dates
        if (diffInSeconds < 0) {
            const absSeconds = Math.abs(diffInSeconds);
            
            if (absSeconds < 60) return 'in a few seconds';
            if (absSeconds < 120) return 'in a minute';
            if (absSeconds < 3600) return `in ${Math.floor(absSeconds / 60)} minutes`;
            if (absSeconds < 7200) return 'in an hour';
            if (absSeconds < 86400) return `in ${Math.floor(absSeconds / 3600)} hours`;
            if (absSeconds < 172800) return 'tomorrow';
            if (absSeconds < 604800) return `in ${Math.floor(absSeconds / 86400)} days`;
            if (absSeconds < 1209600) return 'next week';
            if (absSeconds < 2419200) return `in ${Math.floor(absSeconds / 604800)} weeks`;
            
            // Fall back to calendar date for distant future
            return formatCalendarDate(date);
        }
        
        // Past dates
        if (diffInSeconds < 5) return 'just now';
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 120) return 'a minute ago';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 7200) return 'an hour ago';
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 172800) return 'yesterday';
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 1209600) return 'last week';
        if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
        
        // Fall back to calendar date for distant past
        return formatCalendarDate(date);
    };
    
    /**
     * Format a date in calendar style (e.g., "Today, 3:45 PM" or "Jan 5, 2023")
     * @param {Date} date - Date to format
     * @returns {string} Calendar date string
     */
    const formatCalendarDate = (date) => {
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && 
                       date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
        
        const isYesterday = date.getDate() === now.getDate() - 1 && 
                           date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear();
        
        const isTomorrow = date.getDate() === now.getDate() + 1 && 
                          date.getMonth() === now.getMonth() && 
                          date.getFullYear() === now.getFullYear();
        
        const time = date.toLocaleTimeString(navigator.language || 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (isToday) return `Today, ${time}`;
        if (isYesterday) return `Yesterday, ${time}`;
        if (isTomorrow) return `Tomorrow, ${time}`;
        
        return date.toLocaleDateString(navigator.language || 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    /**
     * Truncate text to a specified length with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @param {string} ellipsis - String to append when truncated
     * @returns {string} Truncated text
     */
    const truncateText = (text, maxLength = 100, ellipsis = '...') => {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + ellipsis;
    };
    
    /**
     * Generate a random ID
     * @param {number} length - Length of the ID
     * @returns {string} Random ID
     */
    const generateRandomId = (length = 10) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    };
    
    /**
     * Debounce a function to limit how often it can be called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait = 300) => {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    /**
     * Throttle a function to limit how often it can be called
     * @param {Function} func - Function to throttle
     * @param {number} limit - Milliseconds to wait between executions
     * @returns {Function} Throttled function
     */
    const throttle = (func, limit = 300) => {
        let waiting = false;
        
        return function(...args) {
            if (!waiting) {
                func.apply(this, args);
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, limit);
            }
        };
    };
    
    /**
     * Validate an email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    /**
     * Validate a password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with strength and message
     */
    const validatePassword = (password) => {
        if (!password) {
            return { valid: false, strength: 0, message: 'Password is required' };
        }
        
        let strength = 0;
        let message = '';
        
        // Length check
        if (password.length < 8) {
            message = 'Password should be at least 8 characters';
        } else {
            strength += 1;
        }
        
        // Complexity checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        // Overall assessment
        if (strength === 1) {
            message = 'Password is too weak';
        } else if (strength === 2) {
            message = 'Password strength is medium';
        } else if (strength === 3) {
            message = 'Password strength is good';
        } else if (strength >= 4) {
            message = 'Password strength is excellent';
        }
        
        return {
            valid: strength >= 3,
            strength: strength,
            message: message
        };
    };
    
    /**
     * Get a URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value
     */
    const getUrlParameter = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise} Promise resolving when copy is complete
     */
    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    };
    
    /**
     * Format file size in human-readable form
     * @param {number} bytes - Size in bytes
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted size
     */
    const formatFileSize = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    };
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} html - String to escape
     * @returns {string} Escaped string
     */
    const escapeHtml = (html) => {
        if (!html) return '';
        
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Handle Date
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // Handle Array
        if (Array.isArray(obj)) {
            return obj.map(item => deepClone(item));
        }
        
        // Handle Object
        if (obj instanceof Object) {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = deepClone(obj[key]);
            });
            return copy;
        }
        
        throw new Error('Unable to copy object! Its type is not supported.');
    };
    
    /**
     * Detect device type
     * @returns {string} Device type ('mobile', 'tablet', or 'desktop')
     */
    const getDeviceType = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
            return 'tablet';
        }
        
        if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        
        return 'desktop';
    };
    
    /**
     * Generate downloadable memory file
     * @param {Object} capsule - Capsule object
     * @param {Object} media - Media object (optional)
     * @param {string} themeName - Theme name
     * @returns {string} HTML content for download
     */
    const generateMemoryFile = (capsule, media, themeName) => {
        const date = new Date(capsule.unlockDate);
        const formattedDate = formatDate(date, { format: 'full', includeTime: true });
        
        // Create HTML content
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UnwrapLater Memory - ${formattedDate}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                }
                .memory-container {
                    background-color: white;
                    border-radius: 10px;
                    padding: 25px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    margin: 30px 0;
                }
                .memory-header {
                    text-align: center;
                    margin-bottom: 25px;
                }
                .memory-header h1 {
                    color: #8e44ad;
                    margin-bottom: 5px;
                }
                .memory-date {
                    color: #666;
                    font-style: italic;
                }
                .memory-content {
                    white-space: pre-wrap;
                    font-size: 1.1rem;
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f8f8f8;
                    border-radius: 8px;
                    border-left: 4px solid #8e44ad;
                }
                .memory-media {
                    text-align: center;
                    margin: 25px 0;
                }
                .memory-media img, 
                .memory-media video {
                    max-width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .memory-footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 0.9rem;
                }
                .theme-${themeName} {
                    border-color: var(--theme-primary);
                }
            </style>
        </head>
        <body>
            <div class="memory-container">
                <div class="memory-header">
                    <h1>UnwrapLater Memory</h1>
                    <p class="memory-date">Opened on ${formattedDate}</p>
                </div>
                
                <div class="memory-content">
                    ${escapeHtml(capsule.message)}
                </div>`;
                
        // Add media if exists
        if (media && media.data) {
            if (media.type.startsWith('image/')) {
                htmlContent += `
                <div class="memory-media">
                    <img src="${media.data}" alt="Memory image">
                </div>`;
            } else if (media.type.startsWith('video/')) {
                htmlContent += `
                <div class="memory-media">
                    <video controls>
                        <source src="${media.data}" type="${media.type}">
                        Your browser does not support the video tag.
                    </video>
                </div>`;
            }
        }
        
        // Close HTML content
        htmlContent += `
                <div class="memory-footer">
                    <p>This memory was created with UnwrapLater</p>
                    <p>Created on ${formatDate(capsule.createdAt || new Date(), { format: 'full' })}</p>
                </div>
            </div>
        </body>
        </html>`;
        
        return htmlContent;
    };
    
    /**
     * Download data as a file
     * @param {string} content - Content to download
     * @param {string} filename - Name of the file
     * @param {string} contentType - MIME type of the file
     */
    const downloadFile = (content, filename, contentType = 'text/plain') => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };
    
    /**
     * Convert a Canvas to a data URL and download
     * @param {HTMLCanvasElement} canvas - Canvas element to download
     * @param {string} filename - Name for the downloaded file
     */
    const downloadCanvas = (canvas, filename) => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();
    };
    
    return {
        formatDate,
        formatRelativeTime,
        formatCalendarDate,
        truncateText,
        generateRandomId,
        debounce,
        throttle,
        isValidEmail,
        validatePassword,
        getUrlParameter,
        copyToClipboard,
        formatFileSize,
        escapeHtml,
        deepClone,
        getDeviceType,
        generateMemoryFile,
        downloadFile,
        downloadCanvas
    };
})(); 