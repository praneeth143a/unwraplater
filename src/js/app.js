/**
 * UnwrapLater - Time Capsule App
 * Main application logic
 */

class TimeCapsuleApp {
    constructor() {
        // Views
        this.createView = document.getElementById('create-view');
        this.resultView = document.getElementById('result-view');
        this.unlockView = document.getElementById('unlock-view');
        
        // Form elements
        this.messageInput = document.getElementById('message');
        this.unlockTimeInput = document.getElementById('unlock-time');
        this.themeSelect = document.getElementById('theme-select');
        this.passphraseInput = document.getElementById('passphrase');
        
        // Result elements
        this.capsuleLinkInput = document.getElementById('capsule-link');
        
        // Unlock elements
        this.timerContainer = document.getElementById('timer-container');
        this.passphraseContainer = document.getElementById('passphrase-container');
        this.capsuleContent = document.getElementById('capsule-content');
        this.revealedMessage = document.getElementById('revealed-message');
        
        // Button handlers
        this.setupButtonHandlers();
        
        // Set default unlock time (1 minute from now)
        this.setDefaultUnlockTime();
        
        // Check if there's a capsule in the URL
        this.checkForCapsuleInUrl();
        
        // Setup dark/light mode toggle
        this.setupThemeToggle();
        
        // Initialize countdown timer
        this.countdown = null;
    }
    
    setupButtonHandlers() {
        // Create capsule button
        document.getElementById('create-capsule').addEventListener('click', () => this.createCapsule());
        
        // Copy link button
        document.getElementById('copy-link').addEventListener('click', () => this.copyLink());
        
        // Download capsule button
        document.getElementById('download-capsule').addEventListener('click', () => this.downloadCapsule());
        
        // Create new button
        document.getElementById('create-new').addEventListener('click', () => this.showCreateView());
        
        // Submit passphrase button
        document.getElementById('submit-passphrase').addEventListener('click', () => this.submitPassphrase());
        document.getElementById('enter-passphrase').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.submitPassphrase();
        });
        
        // Create new from unlock view button
        document.getElementById('create-new-from-unlock').addEventListener('click', () => this.showCreateView());
    }
    
    setDefaultUnlockTime() {
        const now = new Date();
        // Set default to 1 minute from now instead of 1 hour
        now.setMinutes(now.getMinutes() + 1);
        
        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        this.unlockTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    showView(view) {
        // Hide all views
        this.createView.classList.remove('active');
        this.resultView.classList.remove('active');
        this.unlockView.classList.remove('active');
        
        // Show requested view
        view.classList.add('active');
        
        // Stop any animations when switching views
        animationManager.stopAnimation();
        
        // Start animations for specific views
        if (view === this.unlockView && !this.isLocked) {
            const currentTheme = themesManager.getCurrentTheme();
            animationManager.startAnimation(currentTheme.animation);
            
            // If theme uses confetti, trigger a burst
            if (currentTheme.useConfetti) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                animationManager.burstConfetti(centerX, centerY, 100);
            }
        }
    }
    
    showCreateView() {
        this.showView(this.createView);
        // Clear URL fragment
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    
    async createCapsule() {
        // Validate inputs
        const message = this.messageInput.value.trim();
        if (!message) {
            alert('Please enter a message.');
            return;
        }
        
        const unlockTimeStr = this.unlockTimeInput.value;
        if (!unlockTimeStr) {
            alert('Please select an unlock time.');
            return;
        }
        
        const unlockTime = new Date(unlockTimeStr).getTime();
        const now = Date.now();
        
        // Check if unlock time is at least 1 minute in the future
        const oneMinute = 60 * 1000; // 1 minute in milliseconds
        if (unlockTime < now + oneMinute) {
            alert('Unlock time must be at least 1 minute in the future.');
            return;
        }
        
        // Get theme data
        const themeData = themesManager.getThemeData();
        
        // Create capsule data
        let capsuleData = {
            message: message,
            unlockTime: unlockTime,
            theme: themeData,
            createdAt: now
        };
        
        // Encrypt if passphrase provided
        const passphrase = this.passphraseInput.value;
        if (passphrase) {
            try {
                const encryptedMessage = await cryptoManager.encryptMessage(message, passphrase);
                capsuleData.message = encryptedMessage;
                capsuleData.isEncrypted = true;
            } catch (error) {
                console.error('Encryption failed:', error);
                alert('Failed to encrypt message. Please try again.');
                return;
            }
        }
        
        // Generate and display the capsule link by embedding the data in the URL
        const capsuleLink = this.generateCapsuleLink(capsuleData);
        this.capsuleLinkInput.value = capsuleLink;
        
        // Store the current capsule for download
        this.currentCapsule = {
            data: capsuleData
        };
        
        // Show result view
        this.showView(this.resultView);
    }
    
    /**
     * Generate a shareable link by encoding the capsule data into the URL hash
     * @param {Object} capsuleData - The capsule data object
     * @returns {string} - The shareable URL with encoded capsule data
     */
    generateCapsuleLink(capsuleData) {
        try {
            // Convert the capsule data to a JSON string
            const dataStr = JSON.stringify(capsuleData);
            
            // Use encodeURIComponent before btoa to handle Unicode characters properly
            const encodedData = this.safeBase64Encode(dataStr);
            
            // Use a full absolute URL instead of relative one to ensure it works across devices
            // Get the current origin (protocol + hostname + port)
            const origin = window.location.origin;
            const pathname = window.location.pathname;
            
            // Create the URL with the encoded data in the hash
            return `${origin}${pathname}#${encodedData}`;
        } catch (error) {
            console.error('Failed to generate capsule link:', error);
            alert('Failed to create capsule link. The data might be too large.');
            return window.location.href;
        }
    }
    
    /**
     * Safe base64 encoding that works across all browsers and handles Unicode
     * @param {string} str - String to encode
     * @returns {string} - Base64 encoded string
     */
    safeBase64Encode(str) {
        try {
            // First encode the string as URI component to handle Unicode characters
            const encodedStr = encodeURIComponent(str);
            // Then convert to base64
            return btoa(encodedStr);
        } catch (e) {
            console.error('Base64 encoding error:', e);
            // Fallback for very large strings
            return encodeURIComponent(str);
        }
    }
    
    /**
     * Safe base64 decoding that works across all browsers and handles Unicode
     * @param {string} base64 - Base64 encoded string
     * @returns {string} - Decoded string
     */
    safeBase64Decode(base64) {
        try {
            // First decode from base64
            const decodedStr = atob(base64);
            // Then decode URI component to handle Unicode characters
            return decodeURIComponent(decodedStr);
        } catch (e) {
            console.error('Base64 decoding error:', e);
            // Fallback for non-base64 encoded strings
            try {
                return decodeURIComponent(base64);
            } catch (e2) {
                // Last resort
                return base64;
            }
        }
    }
    
    copyLink() {
        // Modern clipboard API when available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.capsuleLinkInput.value)
                .then(() => {
                    // Show success feedback
                    const copyBtn = document.getElementById('copy-link');
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy link:', err);
                    // Fallback to older method
                    this.fallbackCopyToClipboard();
                });
        } else {
            // Fallback for older browsers
            this.fallbackCopyToClipboard();
        }
    }
    
    fallbackCopyToClipboard() {
        this.capsuleLinkInput.select();
        this.capsuleLinkInput.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                // Visual feedback
                const copyBtn = document.getElementById('copy-link');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            } else {
                alert('Please copy the link manually');
            }
        } catch (err) {
            console.error('Failed to copy using execCommand:', err);
            alert('Please copy the link manually');
        }
    }
    
    downloadCapsule() {
        if (!this.currentCapsule) {
            alert('No capsule available to download.');
            return;
        }
        
        // Create a download link
        const dataStr = JSON.stringify(this.currentCapsule.data);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', `unwraplater_capsule.json`);
        document.body.appendChild(downloadLink);
        
        // Trigger download
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
    }
    
    /**
     * Check if the URL contains a capsule in the hash
     * If found, attempt to decode and load it
     */
    checkForCapsuleInUrl() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            // Remove the # symbol and try to decode
            const encodedData = hash.substring(1);
            this.decodeCapsuleFromHash(encodedData);
        }
    }
    
    /**
     * Decode capsule data from a URL hash
     * @param {string} encodedData - Base64 encoded capsule data
     */
    decodeCapsuleFromHash(encodedData) {
        try {
            // Use the improved safe decoding method
            const jsonStr = this.safeBase64Decode(encodedData);
            
            // Parse the JSON string to get the capsule data
            const capsuleData = JSON.parse(jsonStr);
            
            // Process the capsule data
            this.processCapsuleData(capsuleData);
        } catch (error) {
            console.error('Failed to decode capsule data:', error);
            alert('Capsule not found or invalid. The link might be corrupted.');
        }
    }
    
    /**
     * Process the decoded capsule data
     * @param {Object} capsuleData - The decoded capsule data
     */
    processCapsuleData(capsuleData) {
        try {
            // Store for access in unlock process
            this.currentCapsule = {
                data: capsuleData
            };
            
            // Apply the theme
            if (capsuleData.theme) {
                themesManager.loadThemeFromData(capsuleData.theme);
            }
            
            // Check if it's time to unlock
            const now = Date.now();
            const unlockTime = capsuleData.unlockTime;
            
            if (unlockTime > now) {
                // Not yet time to unlock
                this.setupCountdown(unlockTime);
                this.timerContainer.classList.remove('hidden');
                this.isLocked = true;
            } else {
                // Time to unlock, but check if passphrase required
                this.isLocked = false;
                
                if (capsuleData.isEncrypted) {
                    // Passphrase required
                    this.passphraseContainer.classList.remove('hidden');
                } else {
                    // No passphrase, reveal message
                    this.revealMessage(capsuleData.message);
                }
            }
            
            // Show unlock view
            this.showView(this.unlockView);
        } catch (error) {
            console.error('Failed to process capsule data:', error);
            alert('Failed to load capsule. The capsule data might be corrupted.');
        }
    }
    
    setupCountdown(unlockTime) {
        // Clear any existing countdown
        if (this.countdown) {
            clearInterval(this.countdown);
        }
        
        const updateCountdown = () => {
            const now = Date.now();
            const timeLeft = unlockTime - now;
            
            if (timeLeft <= 0) {
                // Time's up, clear countdown and show message
                clearInterval(this.countdown);
                this.timerContainer.classList.add('hidden');
                
                // Check if passphrase required
                const capsuleData = this.currentCapsule.data;
                if (capsuleData.isEncrypted) {
                    this.passphraseContainer.classList.remove('hidden');
                } else {
                    this.revealMessage(capsuleData.message);
                }
                
                this.isLocked = false;
                
                // Start animation
                const currentTheme = themesManager.getCurrentTheme();
                animationManager.startAnimation(currentTheme.animation);
                
                return;
            }
            
            // Calculate days, hours, minutes, seconds
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            // Update UI
            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        };
        
        // Initial update
        updateCountdown();
        
        // Start countdown
        this.countdown = setInterval(updateCountdown, 1000);
    }
    
    async submitPassphrase() {
        if (!this.currentCapsule) {
            alert('No capsule loaded.');
            return;
        }
        
        const passphrase = document.getElementById('enter-passphrase').value;
        if (!passphrase) {
            alert('Please enter the passphrase.');
            return;
        }
        
        try {
            const capsuleData = this.currentCapsule.data;
            const decryptedMessage = await cryptoManager.decryptMessage(capsuleData.message, passphrase);
            
            // Hide passphrase form
            this.passphraseContainer.classList.add('hidden');
            
            // Reveal message
            this.revealMessage(decryptedMessage);
        } catch (error) {
            console.error('Decryption failed:', error);
            alert('Invalid passphrase. Please try again.');
        }
    }
    
    revealMessage(message) {
        // Set message content
        this.revealedMessage.textContent = message;
        
        // Apply theme to message container
        const messageContainer = document.querySelector('.message-container');
        themesManager.applyThemeToMessage(messageContainer);
        
        // Show message container
        this.capsuleContent.classList.remove('hidden');
        
        // Start animation if not already started
        if (!animationManager.isActive) {
            const currentTheme = themesManager.getCurrentTheme();
            animationManager.startAnimation(currentTheme.animation);
            
            // If theme uses confetti, trigger a burst
            if (currentTheme.useConfetti) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 3;
                animationManager.burstConfetti(centerX, centerY, 100);
            }
        }
    }
    
    setupThemeToggle() {
        const toggleElement = document.querySelector('.theme-toggle');
        const lightModeBtn = toggleElement.querySelector('.light-mode');
        const darkModeBtn = toggleElement.querySelector('.dark-mode');
        
        // Check if dark mode is preferred or previously set
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedMode = localStorage.getItem('darkMode');
        
        if (savedMode === 'true' || (savedMode === null && prefersDarkMode)) {
            document.body.classList.add('dark-mode');
        }
        
        // Toggle dark mode
        toggleElement.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TimeCapsuleApp();
}); 