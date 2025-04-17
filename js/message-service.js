/**
 * Message Service
 * Handles time capsule message operations for the UnwrapLater app
 */
const MessageService = (() => {
    // Default message structure
    const DEFAULT_MESSAGE = {
        id: null,
        content: '',
        unlockDate: null,
        createdAt: null,
        theme: 'love',
        hasPassphrase: false,
        encryptedContent: null,
        mediaType: null,
        mediaData: null,
        soundEnabled: true,
        status: 'draft', // draft, scheduled, delivered, opened
        isExpired: false
    };
    
    /**
     * Create a new time capsule message
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} Created message
     */
    const createMessage = async (messageData) => {
        try {
            // Generate ID if not provided
            const id = messageData.id || Helpers.generateRandomId();
            const now = new Date();
            
            // Create message object with defaults
            const message = {
                ...DEFAULT_MESSAGE,
                ...messageData,
                id,
                createdAt: now.toISOString(),
                status: 'draft'
            };
            
            // Encrypt content if passphrase is provided
            if (messageData.passphrase) {
                message.hasPassphrase = true;
                message.encryptedContent = await CryptoManager.encryptMessage(
                    message.content, 
                    messageData.passphrase
                );
                // Remove plaintext content for security
                message.content = '';
            }
            
            // Save to storage
            await Storage.saveMessage(message);
            
            // Publish event
            EventBus.publish(EventBus.EVENTS.MESSAGE_CREATED, message);
            
            return message;
        } catch (error) {
            console.error('Error creating message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.createMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Schedule a message for future delivery
     * @param {string} messageId - ID of the message to schedule
     * @param {Date|string} unlockDate - Date when message can be unlocked
     * @returns {Promise<Object>} Scheduled message
     */
    const scheduleMessage = async (messageId, unlockDate) => {
        try {
            // Get the message
            const message = await Storage.getMessage(messageId);
            if (!message) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            
            // Update status and unlock date
            const updatedMessage = {
                ...message,
                unlockDate: new Date(unlockDate).toISOString(),
                status: 'scheduled'
            };
            
            // Save updated message
            await Storage.saveMessage(updatedMessage);
            
            // Publish event
            EventBus.publish(EventBus.EVENTS.MESSAGE_SCHEDULED, updatedMessage);
            
            return updatedMessage;
        } catch (error) {
            console.error('Error scheduling message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.scheduleMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Get a message by ID
     * @param {string} messageId - ID of the message to retrieve
     * @returns {Promise<Object>} Retrieved message
     */
    const getMessage = async (messageId) => {
        try {
            const message = await Storage.getMessage(messageId);
            if (!message) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            
            // Check if message is expired (unlock date has passed)
            if (message.unlockDate) {
                message.isExpired = new Date(message.unlockDate) <= new Date();
            }
            
            return message;
        } catch (error) {
            console.error('Error getting message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.getMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Get all messages
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>} Array of messages
     */
    const getAllMessages = async (filters = {}) => {
        try {
            const messages = await Storage.getAllMessages();
            
            // Apply filters if provided
            let filteredMessages = messages;
            
            if (filters.status) {
                filteredMessages = filteredMessages.filter(msg => msg.status === filters.status);
            }
            
            if (filters.theme) {
                filteredMessages = filteredMessages.filter(msg => msg.theme === filters.theme);
            }
            
            // Update expired status
            filteredMessages = filteredMessages.map(message => ({
                ...message,
                isExpired: message.unlockDate && new Date(message.unlockDate) <= new Date()
            }));
            
            // Sort by created date (newest first)
            filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return filteredMessages;
        } catch (error) {
            console.error('Error getting all messages:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.getAllMessages',
                error
            });
            throw error;
        }
    };
    
    /**
     * Update a message
     * @param {string} messageId - ID of the message to update
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated message
     */
    const updateMessage = async (messageId, updates) => {
        try {
            const message = await Storage.getMessage(messageId);
            if (!message) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            
            // Special handling for passphrase changes
            if (updates.passphrase !== undefined) {
                // If removing passphrase protection
                if (!updates.passphrase && message.hasPassphrase) {
                    updates.hasPassphrase = false;
                    updates.encryptedContent = null;
                    // Content must be provided in the updates if removing passphrase protection
                    if (!updates.content) {
                        throw new Error('Content must be provided when removing passphrase protection');
                    }
                }
                // If adding or changing passphrase
                else if (updates.passphrase && updates.content) {
                    updates.hasPassphrase = true;
                    updates.encryptedContent = await CryptoManager.encryptMessage(
                        updates.content, 
                        updates.passphrase
                    );
                    // Remove plaintext content for security
                    updates.content = '';
                }
                
                // Remove passphrase from updates to prevent storage
                delete updates.passphrase;
            }
            
            // Create updated message
            const updatedMessage = {
                ...message,
                ...updates
            };
            
            // Save updated message
            await Storage.saveMessage(updatedMessage);
            
            // Publish event
            EventBus.publish(EventBus.EVENTS.MESSAGE_UPDATED, updatedMessage);
            
            return updatedMessage;
        } catch (error) {
            console.error('Error updating message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.updateMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Delete a message
     * @param {string} messageId - ID of the message to delete
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    const deleteMessage = async (messageId) => {
        try {
            const result = await Storage.deleteMessage(messageId);
            
            if (result) {
                // Publish event
                EventBus.publish(EventBus.EVENTS.MESSAGE_DELETED, { id: messageId });
            }
            
            return result;
        } catch (error) {
            console.error('Error deleting message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.deleteMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Unlock a message with a passphrase
     * @param {string} messageId - ID of the message to unlock
     * @param {string} passphrase - Passphrase for decryption
     * @returns {Promise<Object>} Unlocked message with decrypted content
     */
    const unlockMessage = async (messageId, passphrase) => {
        try {
            const message = await Storage.getMessage(messageId);
            if (!message) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            
            if (!message.hasPassphrase || !message.encryptedContent) {
                throw new Error('Message does not have passphrase protection');
            }
            
            // Decrypt the content
            const decryptedContent = await CryptoManager.decryptMessage(
                message.encryptedContent,
                passphrase
            );
            
            // Mark message as opened
            const updatedMessage = {
                ...message,
                content: decryptedContent,
                status: 'opened'
            };
            
            // Update the message status without changing the encrypted content
            await Storage.saveMessage({
                ...message,
                status: 'opened'
            });
            
            // Publish event
            EventBus.publish(EventBus.EVENTS.MESSAGE_DELIVERED, updatedMessage);
            
            return updatedMessage;
        } catch (error) {
            console.error('Error unlocking message:', error);
            EventBus.publish(EventBus.EVENTS.APP_ERROR, {
                source: 'MessageService.unlockMessage',
                error
            });
            throw error;
        }
    };
    
    /**
     * Generate a shareable link for a message
     * @param {string} messageId - ID of message to create link for
     * @returns {string} Shareable URL
     */
    const generateShareableLink = (messageId) => {
        // Create a URL with the message ID
        const baseUrl = window.location.origin;
        return `${baseUrl}/open?id=${messageId}`;
    };
    
    /**
     * Get a message by its ID from the URL query parameter
     * @returns {Promise<Object>} Message object or null
     */
    const getMessageFromUrl = async () => {
        const messageId = Helpers.getUrlParameter('id');
        if (!messageId) return null;
        
        try {
            return await getMessage(messageId);
        } catch (error) {
            console.error('Error getting message from URL:', error);
            return null;
        }
    };
    
    /**
     * Check if a message is ready to be opened
     * @param {Object} message - Message to check
     * @returns {boolean} Whether message can be opened
     */
    const canOpenMessage = (message) => {
        if (!message) return false;
        
        // Check unlock date
        if (message.unlockDate) {
            const unlockDate = new Date(message.unlockDate);
            const now = new Date();
            
            if (unlockDate > now) {
                return false;
            }
        }
        
        return true;
    };
    
    /**
     * Calculate time remaining until message can be unlocked
     * @param {Object} message - Message to check
     * @returns {Object} Time remaining information
     */
    const getTimeRemaining = (message) => {
        if (!message || !message.unlockDate) {
            return { expired: true, display: 'Ready to open!' };
        }
        
        return Helpers.timeRemaining(message.unlockDate);
    };
    
    // Listen for scheduled messages that should be marked as deliverable
    const checkScheduledMessages = async () => {
        try {
            const scheduledMessages = await getAllMessages({ status: 'scheduled' });
            const now = new Date();
            
            for (const message of scheduledMessages) {
                const unlockDate = new Date(message.unlockDate);
                
                if (unlockDate <= now && message.status === 'scheduled') {
                    // Update status to delivered
                    await updateMessage(message.id, { status: 'delivered' });
                    
                    // Publish event
                    EventBus.publish(EventBus.EVENTS.MESSAGE_DELIVERED, message);
                }
            }
        } catch (error) {
            console.error('Error checking scheduled messages:', error);
        }
    };
    
    // Set up interval to check scheduled messages
    let checkInterval = null;
    
    const startMessageChecking = () => {
        if (!checkInterval) {
            // Check every minute
            checkInterval = setInterval(checkScheduledMessages, 60000);
            // Also check immediately
            checkScheduledMessages();
        }
    };
    
    const stopMessageChecking = () => {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    };
    
    // Start checking when app is loaded
    EventBus.subscribe(EventBus.EVENTS.APP_LOADED, startMessageChecking);
    
    // Handle network status changes
    EventBus.subscribe(EventBus.EVENTS.NETWORK_ONLINE, startMessageChecking);
    EventBus.subscribe(EventBus.EVENTS.NETWORK_OFFLINE, stopMessageChecking);
    
    // Public API
    return {
        createMessage,
        scheduleMessage,
        getMessage,
        getAllMessages,
        updateMessage,
        deleteMessage,
        unlockMessage,
        generateShareableLink,
        getMessageFromUrl,
        canOpenMessage,
        getTimeRemaining,
        DEFAULT_MESSAGE
    };
})(); 