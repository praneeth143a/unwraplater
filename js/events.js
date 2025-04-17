/**
 * Events System
 * Manages pub/sub events for the UnwrapLater app
 */
const EventBus = (() => {
    // Event storage
    const events = {};
    
    // Event names constants
    const EVENT_NAMES = {
        // Message events
        MESSAGE_CREATED: 'message:created',
        MESSAGE_UPDATED: 'message:updated',
        MESSAGE_DELETED: 'message:deleted',
        MESSAGE_SENT: 'message:sent',
        MESSAGE_SCHEDULED: 'message:scheduled',
        MESSAGE_DELIVERED: 'message:delivered',
        MESSAGE_FAILED: 'message:failed',
        
        // User events
        USER_LOGGED_IN: 'user:logged_in',
        USER_LOGGED_OUT: 'user:logged_out',
        USER_UPDATED: 'user:updated',
        
        // Settings events
        SETTINGS_UPDATED: 'settings:updated',
        THEME_CHANGED: 'theme:changed',
        
        // UI events
        MODAL_OPENED: 'modal:opened',
        MODAL_CLOSED: 'modal:closed',
        SIDEBAR_TOGGLED: 'sidebar:toggled',
        
        // App events
        APP_LOADED: 'app:loaded',
        APP_ERROR: 'app:error',
        NETWORK_ONLINE: 'network:online',
        NETWORK_OFFLINE: 'network:offline',
        
        // Custom user-defined events
        CUSTOM: 'custom'
    };
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when event is triggered
     * @param {Object} options - Subscription options
     * @returns {string} Subscription ID
     */
    const subscribe = (eventName, callback, options = {}) => {
        const { 
            once = false, // Whether to unsubscribe after first trigger
            priority = 0, // Higher priority callbacks are executed first
            context = null // Context for callback execution
        } = options;
        
        if (typeof callback !== 'function') {
            console.error('EventBus.subscribe: callback must be a function');
            return null;
        }
        
        // Create event array if it doesn't exist
        if (!events[eventName]) {
            events[eventName] = [];
        }
        
        // Generate unique subscription ID
        const id = generateSubscriptionId();
        
        // Add subscription
        events[eventName].push({
            id,
            callback,
            once,
            priority,
            context
        });
        
        // Sort by priority (higher first)
        events[eventName].sort((a, b) => b.priority - a.priority);
        
        return id;
    };
    
    /**
     * Subscribe to an event and automatically unsubscribe after first trigger
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when event is triggered
     * @param {Object} options - Subscription options
     * @returns {string} Subscription ID
     */
    const subscribeOnce = (eventName, callback, options = {}) => {
        return subscribe(eventName, callback, { ...options, once: true });
    };
    
    /**
     * Unsubscribe from an event using the subscription ID
     * @param {string} subscriptionId - ID of the subscription to remove
     * @returns {boolean} Whether the unsubscription was successful
     */
    const unsubscribeById = (subscriptionId) => {
        if (!subscriptionId) return false;
        
        let found = false;
        
        // Check all event types
        Object.keys(events).forEach(eventName => {
            const eventSubscriptions = events[eventName];
            const index = eventSubscriptions.findIndex(sub => sub.id === subscriptionId);
            
            if (index !== -1) {
                eventSubscriptions.splice(index, 1);
                found = true;
            }
            
            // Clean up empty event arrays
            if (eventSubscriptions.length === 0) {
                delete events[eventName];
            }
        });
        
        return found;
    };
    
    /**
     * Unsubscribe all instances of a callback from an event
     * @param {string} eventName - Name of the event to unsubscribe from
     * @param {Function} callback - Callback to remove
     * @returns {boolean} Whether any unsubscriptions occurred
     */
    const unsubscribe = (eventName, callback) => {
        if (!events[eventName]) return false;
        
        const initialLength = events[eventName].length;
        
        // Remove all subscriptions with this callback
        events[eventName] = events[eventName].filter(sub => sub.callback !== callback);
        
        // Clean up empty event arrays
        if (events[eventName].length === 0) {
            delete events[eventName];
        }
        
        return events[eventName]?.length !== initialLength;
    };
    
    /**
     * Unsubscribe all callbacks for an event
     * @param {string} eventName - Name of the event to clear
     * @returns {boolean} Whether the event existed and was cleared
     */
    const clearEvent = (eventName) => {
        if (!events[eventName]) return false;
        
        delete events[eventName];
        return true;
    };
    
    /**
     * Clear all event subscriptions
     */
    const clearAllEvents = () => {
        Object.keys(events).forEach(eventName => {
            delete events[eventName];
        });
    };
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {any} data - Data to pass to subscribers
     * @returns {boolean} Whether any subscribers were notified
     */
    const publish = (eventName, data) => {
        if (!events[eventName] || events[eventName].length === 0) {
            return false;
        }
        
        const subscriptionsToRemove = [];
        
        // Call each subscriber
        events[eventName].forEach(subscription => {
            try {
                const { callback, once, context } = subscription;
                
                // Execute callback with provided context or default
                if (context) {
                    callback.call(context, data);
                } else {
                    callback(data);
                }
                
                // Mark for removal if once
                if (once) {
                    subscriptionsToRemove.push(subscription.id);
                }
            } catch (error) {
                console.error(`Error in event subscriber (${eventName}):`, error);
            }
        });
        
        // Remove one-time subscriptions
        subscriptionsToRemove.forEach(id => unsubscribeById(id));
        
        return true;
    };
    
    /**
     * Get the number of subscribers for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of subscribers
     */
    const getSubscriberCount = (eventName) => {
        return events[eventName]?.length || 0;
    };
    
    /**
     * Get a list of all active event names
     * @returns {string[]} Array of event names
     */
    const getActiveEvents = () => {
        return Object.keys(events);
    };
    
    /**
     * Generate a unique subscription ID
     * @returns {string} Unique ID
     * @private
     */
    const generateSubscriptionId = () => {
        return Math.random().toString(36).substring(2, 11) + 
               Date.now().toString(36);
    };
    
    // Set up network event listeners
    window.addEventListener('online', () => publish(EVENT_NAMES.NETWORK_ONLINE));
    window.addEventListener('load', () => publish(EVENT_NAMES.APP_LOADED));
    window.addEventListener('offline', () => publish(EVENT_NAMES.NETWORK_OFFLINE));
    
    // Public API
    return {
        subscribe,
        subscribeOnce,
        unsubscribe,
        unsubscribeById,
        publish,
        clearEvent,
        clearAllEvents,
        getSubscriberCount,
        getActiveEvents,
        EVENTS: EVENT_NAMES
    };
})(); 