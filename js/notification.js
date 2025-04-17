/**
 * Notification Service
 * Handles in-app notifications, toast messages, and browser notifications
 */
const NotificationService = (() => {
    // Default configuration
    const config = {
        position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
        duration: 5000, // Duration in milliseconds
        maxNotifications: 5, // Maximum number of notifications shown at once
        animationDuration: 300, // Animation duration in milliseconds
        closeOnClick: true, // Whether to close notification on click
        pauseOnHover: true, // Whether to pause notification timeout on hover
        showDismissButton: true, // Whether to show dismiss button
        showProgressBar: true, // Whether to show progress bar
        containerClass: 'notification-container', // CSS class for notifications container
        notificationClass: 'notification', // Base CSS class for notification
        types: {
            info: {
                class: 'notification-info',
                icon: 'info-circle'
            },
            success: {
                class: 'notification-success',
                icon: 'check-circle'
            },
            warning: {
                class: 'notification-warning',
                icon: 'exclamation-triangle'
            },
            error: {
                class: 'notification-error',
                icon: 'exclamation-circle'
            }
        },
        browserNotifications: {
            enabled: true, // Whether to use browser notifications
            icon: '/assets/images/logo.png', // Default icon for browser notifications
            requireInteraction: false // Whether notification requires user interaction to dismiss
        }
    };
    
    // Current notifications array
    let notifications = [];
    
    // Container element for notifications
    let container = null;
    
    // Initialize the notification container
    const initContainer = () => {
        if (container) return container;
        
        container = document.createElement('div');
        container.className = config.containerClass;
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'polite');
        
        // Set position class
        container.classList.add(`${config.containerClass}-${config.position}`);
        
        document.body.appendChild(container);
        return container;
    };
    
    /**
     * Set notification service configuration
     * @param {Object} newConfig - New configuration object
     */
    const setConfig = (newConfig) => {
        Object.assign(config, newConfig);
        
        // Update container position if it exists
        if (container) {
            // Remove all position classes
            const positionClasses = [
                'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
            ].map(pos => `${config.containerClass}-${pos}`);
            
            positionClasses.forEach(cls => container.classList.remove(cls));
            
            // Add new position class
            container.classList.add(`${config.containerClass}-${config.position}`);
        }
    };
    
    /**
     * Check if browser notifications are supported
     * @returns {boolean} Whether browser notifications are supported
     */
    const isBrowserNotificationSupported = () => {
        return 'Notification' in window;
    };
    
    /**
     * Request permission for browser notifications
     * @returns {Promise<string>} Permission status
     */
    const requestBrowserNotificationPermission = async () => {
        if (!isBrowserNotificationSupported()) {
            return 'denied';
        }
        
        if (Notification.permission === 'granted' || Notification.permission === 'denied') {
            return Notification.permission;
        }
        
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };
    
    /**
     * Check if browser notifications are enabled
     * @returns {boolean} Whether browser notifications are enabled
     */
    const isBrowserNotificationEnabled = () => {
        return config.browserNotifications.enabled && 
               isBrowserNotificationSupported() && 
               Notification.permission === 'granted';
    };
    
    /**
     * Create a browser notification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     * @returns {Notification|null} Browser notification object or null if not supported
     */
    const createBrowserNotification = (title, options = {}) => {
        if (!isBrowserNotificationEnabled()) {
            return null;
        }
        
        const notificationOptions = {
            icon: config.browserNotifications.icon,
            requireInteraction: config.browserNotifications.requireInteraction,
            ...options
        };
        
        try {
            const notification = new Notification(title, notificationOptions);
            
            // Set up event handlers
            if (options.onClick) {
                notification.onclick = options.onClick;
            }
            
            if (options.onClose) {
                notification.onclose = options.onClose;
            }
            
            if (options.onError) {
                notification.onerror = options.onError;
            }
            
            if (options.onShow) {
                notification.onshow = options.onShow;
            }
            
            return notification;
        } catch (error) {
            console.error('Error creating browser notification:', error);
            return null;
        }
    };
    
    /**
     * Create a notification element
     * @param {Object} options - Notification options
     * @returns {HTMLElement} Notification element
     */
    const createNotificationElement = (options) => {
        const {
            id,
            type = 'info',
            title,
            message,
            duration = config.duration,
            onClick,
            onClose
        } = options;
        
        const typeConfig = config.types[type] || config.types.info;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `${config.notificationClass} ${typeConfig.class}`;
        notification.id = `notification-${id}`;
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        
        // Create notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        // Add icon if specified
        if (typeConfig.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'notification-icon';
            iconWrapper.innerHTML = `<i class="fas fa-${typeConfig.icon}"></i>`;
            content.appendChild(iconWrapper);
        }
        
        // Add text content
        const textContent = document.createElement('div');
        textContent.className = 'notification-text';
        
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'notification-title';
            titleElement.textContent = title;
            textContent.appendChild(titleElement);
        }
        
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'notification-message';
            messageElement.textContent = message;
            textContent.appendChild(messageElement);
        }
        
        content.appendChild(textContent);
        notification.appendChild(content);
        
        // Add dismiss button if enabled
        if (config.showDismissButton) {
            const dismissButton = document.createElement('button');
            dismissButton.className = 'notification-dismiss';
            dismissButton.innerHTML = '&times;';
            dismissButton.setAttribute('aria-label', 'Close notification');
            
            dismissButton.addEventListener('click', (event) => {
                event.stopPropagation();
                removeNotification(id);
                
                if (onClose && typeof onClose === 'function') {
                    onClose();
                }
            });
            
            notification.appendChild(dismissButton);
        }
        
        // Add progress bar if enabled
        if (config.showProgressBar && duration > 0) {
            const progressBar = document.createElement('div');
            progressBar.className = 'notification-progress';
            
            const progressInner = document.createElement('div');
            progressInner.className = 'notification-progress-inner';
            progressBar.appendChild(progressInner);
            
            notification.appendChild(progressBar);
            
            // Animate progress bar
            progressInner.style.transition = `width ${duration}ms linear`;
            progressInner.style.width = '100%';
            
            // Force reflow to make transition work
            progressInner.getBoundingClientRect();
            progressInner.style.width = '0%';
        }
        
        // Add click event
        if (config.closeOnClick || onClick) {
            notification.addEventListener('click', () => {
                if (onClick && typeof onClick === 'function') {
                    onClick();
                }
                
                if (config.closeOnClick) {
                    removeNotification(id);
                    
                    if (onClose && typeof onClose === 'function') {
                        onClose();
                    }
                }
            });
        }
        
        // Add hover events to pause/resume timer
        if (config.pauseOnHover && duration > 0) {
            notification.addEventListener('mouseenter', () => {
                notification.classList.add('notification-paused');
                
                const progressInner = notification.querySelector('.notification-progress-inner');
                if (progressInner) {
                    const computedStyle = window.getComputedStyle(progressInner);
                    const width = computedStyle.getPropertyValue('width');
                    progressInner.style.transition = 'none';
                    progressInner.style.width = width;
                }
            });
            
            notification.addEventListener('mouseleave', () => {
                notification.classList.remove('notification-paused');
                
                const progressInner = notification.querySelector('.notification-progress-inner');
                if (progressInner) {
                    const computedStyle = window.getComputedStyle(progressInner);
                    const width = parseFloat(computedStyle.getPropertyValue('width'));
                    const totalWidth = parseFloat(computedStyle.getPropertyValue('width', progressInner.parentNode));
                    const percentLeft = (width / totalWidth) * 100;
                    const timeLeft = (percentLeft / 100) * duration;
                    
                    progressInner.style.transition = `width ${timeLeft}ms linear`;
                    progressInner.style.width = '0%';
                }
            });
        }
        
        return notification;
    };
    
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @returns {string} Notification ID
     */
    const show = (options) => {
        const id = generateId();
        const container = initContainer();
        
        // Create merged options
        const notificationOptions = {
            id,
            ...options,
            duration: options.duration !== undefined ? options.duration : config.duration
        };
        
        // Create notification element
        const notificationElement = createNotificationElement(notificationOptions);
        
        // Ensure we don't exceed max notifications
        if (notifications.length >= config.maxNotifications) {
            // Remove oldest notification
            const oldestNotification = notifications[0];
            removeNotification(oldestNotification.id);
        }
        
        // Add to notifications array
        notifications.push({
            id,
            element: notificationElement,
            timeoutId: null,
            addedAt: Date.now(),
            ...notificationOptions
        });
        
        // Add to DOM
        container.appendChild(notificationElement);
        
        // Trigger animation
        setTimeout(() => {
            notificationElement.classList.add('notification-visible');
        }, 10);
        
        // Set timeout to remove notification
        if (notificationOptions.duration > 0) {
            const timeoutId = setTimeout(() => {
                removeNotification(id);
                
                if (notificationOptions.onClose && typeof notificationOptions.onClose === 'function') {
                    notificationOptions.onClose();
                }
            }, notificationOptions.duration);
            
            // Save timeout ID
            const notificationIndex = notifications.findIndex(n => n.id === id);
            if (notificationIndex !== -1) {
                notifications[notificationIndex].timeoutId = timeoutId;
            }
        }
        
        // Also show browser notification if enabled
        if (options.browser && isBrowserNotificationEnabled()) {
            createBrowserNotification(options.title, {
                body: options.message,
                ...options.browserOptions
            });
        }
        
        return id;
    };
    
    /**
     * Update an existing notification
     * @param {string} id - Notification ID
     * @param {Object} options - New notification options
     * @returns {boolean} Whether the update was successful
     */
    const update = (id, options) => {
        const notificationIndex = notifications.findIndex(n => n.id === id);
        
        if (notificationIndex === -1) {
            return false;
        }
        
        const notification = notifications[notificationIndex];
        
        // Clear existing timeout
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        
        // Remove old element
        notification.element.remove();
        
        // Create new options by merging
        const newOptions = {
            ...notification,
            ...options,
            id: notification.id // Preserve ID
        };
        
        // Create new element
        const newElement = createNotificationElement(newOptions);
        newElement.classList.add('notification-visible');
        
        // Add to DOM
        container.appendChild(newElement);
        
        // Update notifications array
        notifications[notificationIndex] = {
            ...newOptions,
            element: newElement,
            timeoutId: null,
            addedAt: Date.now()
        };
        
        // Set new timeout if duration is provided
        const duration = newOptions.duration !== undefined ? newOptions.duration : config.duration;
        if (duration > 0) {
            const timeoutId = setTimeout(() => {
                removeNotification(id);
                
                if (newOptions.onClose && typeof newOptions.onClose === 'function') {
                    newOptions.onClose();
                }
            }, duration);
            
            notifications[notificationIndex].timeoutId = timeoutId;
        }
        
        return true;
    };
    
    /**
     * Remove a notification
     * @param {string} id - Notification ID
     * @returns {boolean} Whether the removal was successful
     */
    const removeNotification = (id) => {
        const notificationIndex = notifications.findIndex(n => n.id === id);
        
        if (notificationIndex === -1) {
            return false;
        }
        
        const notification = notifications[notificationIndex];
        
        // Clear timeout
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        
        // Animate out
        notification.element.classList.remove('notification-visible');
        
        // Remove after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.remove();
            }
        }, config.animationDuration);
        
        // Remove from array
        notifications.splice(notificationIndex, 1);
        
        return true;
    };
    
    /**
     * Clear all notifications
     */
    const clearAll = () => {
        // Clear all timeouts
        notifications.forEach(notification => {
            if (notification.timeoutId) {
                clearTimeout(notification.timeoutId);
            }
            
            // Animate out
            notification.element.classList.remove('notification-visible');
        });
        
        // Remove all elements after animation
        setTimeout(() => {
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            
            // Clear notifications array
            notifications = [];
        }, config.animationDuration);
    };
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };
    
    /**
     * Show an info notification
     * @param {string|Object} message - Notification message or options
     * @param {string} [title] - Notification title
     * @param {Object} [options] - Additional options
     * @returns {string} Notification ID
     */
    const info = (message, title, options = {}) => {
        if (typeof message === 'object') {
            return show({ type: 'info', ...message });
        }
        
        return show({ type: 'info', message, title, ...options });
    };
    
    /**
     * Show a success notification
     * @param {string|Object} message - Notification message or options
     * @param {string} [title] - Notification title
     * @param {Object} [options] - Additional options
     * @returns {string} Notification ID
     */
    const success = (message, title, options = {}) => {
        if (typeof message === 'object') {
            return show({ type: 'success', ...message });
        }
        
        return show({ type: 'success', message, title, ...options });
    };
    
    /**
     * Show a warning notification
     * @param {string|Object} message - Notification message or options
     * @param {string} [title] - Notification title
     * @param {Object} [options] - Additional options
     * @returns {string} Notification ID
     */
    const warning = (message, title, options = {}) => {
        if (typeof message === 'object') {
            return show({ type: 'warning', ...message });
        }
        
        return show({ type: 'warning', message, title, ...options });
    };
    
    /**
     * Show an error notification
     * @param {string|Object} message - Notification message or options
     * @param {string} [title] - Notification title
     * @param {Object} [options] - Additional options
     * @returns {string} Notification ID
     */
    const error = (message, title, options = {}) => {
        if (typeof message === 'object') {
            return show({ type: 'error', ...message });
        }
        
        return show({ type: 'error', message, title, ...options });
    };
    
    // Initialize container on load
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            initContainer();
        });
    }
    
    // Public API
    return {
        show,
        update,
        remove: removeNotification,
        clearAll,
        setConfig,
        info,
        success,
        warning,
        error,
        requestBrowserNotificationPermission,
        isBrowserNotificationSupported,
        isBrowserNotificationEnabled,
        createBrowserNotification
    };
})();