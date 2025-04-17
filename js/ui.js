/**
 * UI Helper
 * Provides UI utilities and components for the UnwrapLater app
 */
const UIHelper = (() => {
    // Store references to important DOM elements
    const elements = {};
    
    // Store modal instances
    const modals = {};
    
    // Current active section
    let activeSection = null;
    
    /**
     * Initialize UI helper and cache DOM elements
     * @returns {Promise} Resolves when initialization is complete
     */
    const init = async () => {
        try {
            // Cache common elements
            elements.main = document.querySelector('main');
            elements.header = document.querySelector('header');
            elements.footer = document.querySelector('footer');
            elements.sections = document.querySelectorAll('section');
            elements.themeToggle = document.getElementById('darkModeToggle');
            
            // Cache form elements
            elements.messageInput = document.getElementById('message');
            elements.unlockDateInput = document.getElementById('unlock-date');
            elements.passphraseInput = document.getElementById('passphrase');
            elements.themeSelect = document.getElementById('theme-select');
            elements.mediaUpload = document.getElementById('media-upload');
            elements.mediaPreview = document.getElementById('media-preview');
            elements.soundEnabled = document.getElementById('sound-enabled');
            
            // Cache buttons
            elements.previewBtn = document.getElementById('preview-btn');
            elements.backToEditBtn = document.getElementById('back-to-edit');
            elements.createCapsuleBtn = document.getElementById('create-capsule');
            elements.copyLinkBtn = document.getElementById('copy-link');
            elements.createNewBtn = document.getElementById('create-new');
            elements.submitPassphraseBtn = document.getElementById('submit-passphrase');
            
            // Find active section
            elements.sections.forEach(section => {
                if (section.classList.contains('active-section')) {
                    activeSection = section;
                }
            });
            
            // Set up theme toggle button
            if (elements.themeToggle) {
                elements.themeToggle.addEventListener('click', () => {
                    ThemeService.toggleAppTheme();
                });
            }
            
            // Initialize based on current URL
            initializeBasedOnUrl();
            
            return true;
        } catch (error) {
            console.error('Error initializing UI helper:', error);
            return false;
        }
    };
    
    /**
     * Initialize the UI based on the current URL
     */
    const initializeBasedOnUrl = () => {
        const url = new URL(window.location.href);
        const messageId = url.searchParams.get('id');
        
        if (messageId) {
            // If there's a message ID in the URL, show the unlock section
            switchSection('unlock-section');
            
            // Load the message
            MessageService.getMessageFromUrl()
                .then(message => {
                    if (message) {
                        renderUnlockMessage(message);
                    } else {
                        showError('Message not found', 'The message you are looking for could not be found.');
                    }
                })
                .catch(error => {
                    console.error('Error loading message:', error);
                    showError('Error loading message', 'There was an error loading the message.');
                });
        } else {
            // Default to create section
            switchSection('create-section');
        }
    };
    
    /**
     * Switch to a different section
     * @param {string} sectionId - ID of the section to switch to
     */
    const switchSection = (sectionId) => {
        // Hide all sections
        elements.sections.forEach(section => {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        });
        
        // Show the target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');
            activeSection = targetSection;
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    };
    
    /**
     * Create a modal dialog
     * @param {Object} options - Modal options
     * @returns {Object} Modal instance
     */
    const createModal = (options = {}) => {
        const {
            id = 'modal-' + Date.now(),
            title = '',
            content = '',
            onClose = null,
            closable = true,
            width = '500px',
            buttons = []
        } = options;
        
        // Check if modal exists
        if (modals[id]) {
            return modals[id];
        }
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.id = id + '-container';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.maxWidth = width;
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        // Create title
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        modalHeader.appendChild(modalTitle);
        
        // Create close button if closable
        if (closable) {
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Close modal');
            
            closeButton.addEventListener('click', () => {
                closeModal(id);
                if (onClose) onClose();
            });
            
            modalHeader.appendChild(closeButton);
        }
        
        modal.appendChild(modalHeader);
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        if (typeof content === 'string') {
            modalContent.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            modalContent.appendChild(content);
        }
        
        modal.appendChild(modalContent);
        
        // Create modal footer if there are buttons
        if (buttons.length > 0) {
            const modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            
            buttons.forEach(button => {
                const btnElement = document.createElement('button');
                btnElement.className = button.primary ? 'primary-btn' : 'secondary-btn';
                btnElement.textContent = button.text;
                
                btnElement.addEventListener('click', () => {
                    if (button.onClick) {
                        const result = button.onClick();
                        // If the result is truthy and not a Promise, close the modal
                        if (result && !(result instanceof Promise)) {
                            closeModal(id);
                        }
                        // If it's a Promise, close after it resolves successfully
                        else if (result instanceof Promise) {
                            result
                                .then(res => {
                                    if (res !== false) closeModal(id);
                                })
                                .catch(console.error);
                        }
                    } else {
                        closeModal(id);
                    }
                });
                
                modalFooter.appendChild(btnElement);
            });
            
            modal.appendChild(modalFooter);
        }
        
        // Add modal to container
        modalContainer.appendChild(modal);
        
        // Clickable background to close modal if closable
        if (closable) {
            modalContainer.addEventListener('click', (event) => {
                if (event.target === modalContainer) {
                    closeModal(id);
                    if (onClose) onClose();
                }
            });
        }
        
        // Add modal to document
        document.body.appendChild(modalContainer);
        
        // Store modal instance
        modals[id] = {
            id,
            container: modalContainer,
            modal,
            content: modalContent,
            
            // Methods
            close: () => closeModal(id),
            setContent: (newContent) => {
                if (typeof newContent === 'string') {
                    modalContent.innerHTML = newContent;
                } else if (newContent instanceof HTMLElement) {
                    modalContent.innerHTML = '';
                    modalContent.appendChild(newContent);
                }
            }
        };
        
        // Publish modal opened event
        EventBus.publish(EventBus.EVENTS.MODAL_OPENED, { id });
        
        // Add animation class after a small delay to trigger animation
        setTimeout(() => {
            modalContainer.classList.add('modal-visible');
        }, 10);
        
        return modals[id];
    };
    
    /**
     * Close a modal
     * @param {string} id - Modal ID
     */
    const closeModal = (id) => {
        const modal = modals[id];
        if (!modal) return;
        
        // Remove visibility class to trigger animation
        modal.container.classList.remove('modal-visible');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (modal.container && modal.container.parentNode) {
                modal.container.parentNode.removeChild(modal.container);
            }
            delete modals[id];
            
            // Publish modal closed event
            EventBus.publish(EventBus.EVENTS.MODAL_CLOSED, { id });
        }, 300); // Match transition duration
    };
    
    /**
     * Close all open modals
     */
    const closeAllModals = () => {
        Object.keys(modals).forEach(closeModal);
    };
    
    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when canceled
     * @returns {Object} Modal instance
     */
    const showConfirmation = (title, message, onConfirm, onCancel) => {
        return createModal({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    text: 'Cancel',
                    primary: false,
                    onClick: () => {
                        if (onCancel) onCancel();
                        return true;
                    }
                },
                {
                    text: 'Confirm',
                    primary: true,
                    onClick: () => {
                        if (onConfirm) return onConfirm();
                        return true;
                    }
                }
            ]
        });
    };
    
    /**
     * Show an error message
     * @param {string} title - Error title
     * @param {string} message - Error message
     * @returns {Object} Modal instance
     */
    const showError = (title, message) => {
        return createModal({
            title,
            content: `<div class="error-message"><p>${message}</p></div>`,
            buttons: [
                {
                    text: 'OK',
                    primary: true,
                    onClick: () => true
                }
            ]
        });
    };
    
    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     * @param {Object} options - Additional options
     */
    const showToast = (message, type = 'info', options = {}) => {
        if (typeof NotificationService !== 'undefined') {
            NotificationService[type](message, options.title, options);
        } else {
            // Simple toast fallback
            const toast = document.createElement('div');
            toast.className = `simple-toast toast-${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Show with animation
            setTimeout(() => {
                toast.classList.add('toast-visible');
            }, 10);
            
            // Auto-remove
            setTimeout(() => {
                toast.classList.remove('toast-visible');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, options.duration || 3000);
        }
    };
    
    /**
     * Render a message in the unlock section
     * @param {Object} message - Message to render
     */
    const renderUnlockMessage = (message) => {
        if (!message) return;
        
        // Set unlock date
        const unlockDateDisplay = document.getElementById('unlock-date-display');
        if (unlockDateDisplay) {
            unlockDateDisplay.textContent = Helpers.formatDate(message.unlockDate);
        }
        
        // Set up passphrase section if needed
        const passphraseContainer = document.getElementById('passphrase-container');
        if (passphraseContainer) {
            if (message.hasPassphrase) {
                passphraseContainer.classList.remove('hidden');
            } else {
                passphraseContainer.classList.add('hidden');
            }
        }
        
        // Check if message can be unlocked
        const canOpen = MessageService.canOpenMessage(message);
        
        // Setup countdown timer if needed
        if (!canOpen && message.unlockDate) {
            updateCountdown(message);
            
            // Start countdown interval
            const countdownInterval = setInterval(() => {
                const updated = updateCountdown(message);
                
                if (updated.expired) {
                    clearInterval(countdownInterval);
                    window.location.reload(); // Reload to show message
                }
            }, 1000);
        }
        
        // Show unlocked container if message can be opened
        if (canOpen && !message.hasPassphrase) {
            showUnlockedMessage(message);
        }
    };
    
    /**
     * Update countdown display
     * @param {Object} message - Message with unlock date
     * @returns {Object} Time remaining info
     */
    const updateCountdown = (message) => {
        const timeRemaining = MessageService.getTimeRemaining(message);
        
        const daysElement = document.getElementById('days-remaining');
        const hoursElement = document.getElementById('hours-remaining');
        const minutesElement = document.getElementById('minutes-remaining');
        const secondsElement = document.getElementById('seconds-remaining');
        
        if (daysElement) daysElement.textContent = timeRemaining.days || '0';
        if (hoursElement) hoursElement.textContent = timeRemaining.hours || '0';
        if (minutesElement) minutesElement.textContent = timeRemaining.minutes || '0';
        if (secondsElement) secondsElement.textContent = timeRemaining.seconds || '0';
        
        const unlockMessage = document.getElementById('unlock-message');
        if (unlockMessage && timeRemaining.expired) {
            unlockMessage.textContent = 'This capsule is ready to open!';
        }
        
        return timeRemaining;
    };
    
    /**
     * Show the unlocked message
     * @param {Object} message - Message to show
     */
    const showUnlockedMessage = (message) => {
        // Hide locked container
        const lockedContainer = document.getElementById('locked-container');
        if (lockedContainer) {
            lockedContainer.classList.add('hidden');
        }
        
        // Show unlocked container
        const unlockedContainer = document.getElementById('unlocked-container');
        if (unlockedContainer) {
            unlockedContainer.classList.remove('hidden');
        }
        
        // Show message content
        const messageReveal = document.getElementById('message-reveal');
        if (messageReveal && message.content) {
            messageReveal.textContent = message.content;
        }
        
        // Display media if available
        if (message.mediaType && message.mediaData) {
            const mediaReveal = document.getElementById('media-reveal');
            if (mediaReveal) {
                mediaReveal.classList.remove('hidden');
                
                if (typeof MediaManager !== 'undefined') {
                    MediaManager.displayMedia(
                        message.mediaData,
                        message.mediaType,
                        mediaReveal,
                        {
                            autoplay: message.mediaType === 'video',
                            controls: true,
                            muted: false,
                            loop: true
                        }
                    );
                } else {
                    // Simple fallback
                    if (message.mediaType === 'image') {
                        const img = document.createElement('img');
                        img.src = message.mediaData;
                        img.alt = 'Message attachment';
                        mediaReveal.appendChild(img);
                    } else if (message.mediaType === 'video') {
                        const video = document.createElement('video');
                        video.src = message.mediaData;
                        video.controls = true;
                        video.autoplay = true;
                        mediaReveal.appendChild(video);
                    }
                }
            }
        }
        
        // Apply theme and animations
        const animationContainer = document.getElementById('theme-animation-container');
        if (animationContainer && typeof ThemeService !== 'undefined') {
            ThemeService.applyMessageTheme(message.theme, unlockedContainer);
            ThemeService.playThemeAnimation(message.theme, animationContainer, message.soundEnabled);
        }
    };
    
    /**
     * Generate QR code for a URL
     * @param {string} url - URL to encode
     * @param {HTMLElement} container - Container to display QR code
     * @param {number} size - Size of QR code in pixels
     */
    const generateQRCode = (url, container, size = 200) => {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Check if QRCode library is available
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: url,
                width: size,
                height: size,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback: display the URL and a message
            container.innerHTML = `
                <div class="qr-fallback">
                    <p>QR Code generation is not available</p>
                    <a href="${url}" target="_blank">${url}</a>
                </div>
            `;
        }
    };
    
    /**
     * Generate a share link display
     * @param {string} url - URL to share
     * @param {HTMLElement} container - Container for link display
     */
    const generateShareLink = (url, container) => {
        if (!container) return;
        
        // Create link input
        const linkInput = document.createElement('input');
        linkInput.type = 'text';
        linkInput.value = url;
        linkInput.readOnly = true;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.innerHTML = '📋';
        copyButton.setAttribute('aria-label', 'Copy link');
        
        copyButton.addEventListener('click', async () => {
            const success = await Helpers.copyToClipboard(url);
            if (success) {
                showToast('Link copied to clipboard!', 'success');
            } else {
                showToast('Failed to copy link', 'error');
            }
        });
        
        // Clear and add to container
        container.innerHTML = '';
        container.appendChild(linkInput);
        container.appendChild(copyButton);
    };
    
    /**
     * Set up form validation for a form
     * @param {HTMLFormElement} form - Form to validate
     * @param {Object} rules - Validation rules
     * @param {Function} onSubmit - Submit callback
     */
    const setupFormValidation = (form, rules, onSubmit) => {
        if (!form || !rules || !onSubmit) return;
        
        // Create error display elements
        Object.keys(rules).forEach(fieldName => {
            const field = form.elements[fieldName];
            if (!field) return;
            
            // Create error element if it doesn't exist
            let errorElement = form.querySelector(`.error-${fieldName}`);
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = `error-message error-${fieldName} hidden`;
                field.parentNode.appendChild(errorElement);
            }
            
            // Add input event listener
            field.addEventListener('input', () => {
                validateField(field, rules[fieldName], errorElement);
            });
            
            // Add blur event listener
            field.addEventListener('blur', () => {
                validateField(field, rules[fieldName], errorElement);
            });
        });
        
        // Add submit event listener
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Validate all fields
            let isValid = true;
            const formData = {};
            
            Object.keys(rules).forEach(fieldName => {
                const field = form.elements[fieldName];
                if (!field) return;
                
                const errorElement = form.querySelector(`.error-${fieldName}`);
                const fieldValid = validateField(field, rules[fieldName], errorElement);
                
                if (!fieldValid) {
                    isValid = false;
                }
                
                // Collect form data
                formData[fieldName] = field.type === 'checkbox' 
                    ? field.checked 
                    : field.value;
            });
            
            // Call onSubmit if all fields are valid
            if (isValid) {
                onSubmit(formData);
            }
        });
        
        /**
         * Validate a single field
         * @param {HTMLElement} field - Field to validate
         * @param {Object} fieldRules - Validation rules for the field
         * @param {HTMLElement} errorElement - Element to display errors
         * @returns {boolean} Whether the field is valid
         */
        function validateField(field, fieldRules, errorElement) {
            if (!field || !fieldRules || !errorElement) return true;
            
            // Get field value
            const value = field.type === 'checkbox' ? field.checked : field.value;
            
            // Validate using ValidationService if available
            if (typeof ValidationService !== 'undefined') {
                const result = ValidationService.validate(value, fieldRules);
                
                if (!result.isValid) {
                    errorElement.textContent = result.errors[0].message;
                    errorElement.classList.remove('hidden');
                    field.classList.add('error');
                    return false;
                } else {
                    errorElement.classList.add('hidden');
                    field.classList.remove('error');
                    return true;
                }
            } else {
                // Simple fallback validation
                if (fieldRules.required && (!value || value.trim() === '')) {
                    errorElement.textContent = 'This field is required';
                    errorElement.classList.remove('hidden');
                    field.classList.add('error');
                    return false;
                }
                
                errorElement.classList.add('hidden');
                field.classList.remove('error');
                return true;
            }
        }
    };
    
    // Initialize on page load
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', init);
    }
    
    // Public API
    return {
        init,
        switchSection,
        createModal,
        closeModal,
        closeAllModals,
        showConfirmation,
        showError,
        showToast,
        renderUnlockMessage,
        showUnlockedMessage,
        generateQRCode,
        generateShareLink,
        setupFormValidation,
        
        // Element getters
        getElement: (id) => elements[id] || document.getElementById(id),
        getActiveSection: () => activeSection
    };
})(); 