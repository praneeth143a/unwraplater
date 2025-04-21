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
        
        // Set default unlock time (1 hour from now)
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
        now.setHours(now.getHours() + 1);
        
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
        if (unlockTime < now) {
            alert('Unlock time must be in the future.');
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
        
        // Store the capsule
        const capsuleId = await this.storeCapsule(capsuleData);
        
        // Generate and display the capsule link
        const capsuleLink = this.generateCapsuleLink(capsuleId);
        this.capsuleLinkInput.value = capsuleLink;
        
        // Store the current capsule for download
        this.currentCapsule = {
            id: capsuleId,
            data: capsuleData
        };
        
        // Show result view
        this.showView(this.resultView);
    }
    
    async storeCapsule(capsuleData) {
        try {
            // Convert to string
            const dataStr = JSON.stringify(capsuleData);
            
            // Try to use localStorage
            const shortId = await cryptoManager.generateShortHash(dataStr);
            
            // Store in localStorage
            localStorage.setItem(`capsule_${shortId}`, dataStr);
            
            return shortId;
        } catch (error) {
            console.error('Failed to store capsule:', error);
            alert('Failed to create capsule. Please try again.');
            throw error;
        }
    }
    
    generateCapsuleLink(capsuleId) {
        // Use URL fragment for sharing
        const baseUrl = window.location.href.split('#')[0];
        return `${baseUrl}#capsule=${capsuleId}`;
    }
    
    copyLink() {
        this.capsuleLinkInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const copyBtn = document.getElementById('copy-link');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
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
        downloadLink.setAttribute('download', `unwraplater_capsule_${this.currentCapsule.id}.json`);
        document.body.appendChild(downloadLink);
        
        // Trigger download
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
    }
    
    checkForCapsuleInUrl() {
        const hash = window.location.hash;
        if (hash && hash.includes('capsule=')) {
            const capsuleId = hash.split('capsule=')[1];
            this.loadCapsule(capsuleId);
        }
    }
    
    async loadCapsule(capsuleId) {
        try {
            // Try to load from localStorage
            const dataStr = localStorage.getItem(`capsule_${capsuleId}`);
            if (!dataStr) {
                alert('Capsule not found. It may have expired or been deleted.');
                return;
            }
            
            // Parse capsule data
            const capsuleData = JSON.parse(dataStr);
            
            // Store for access in unlock process
            this.currentCapsule = {
                id: capsuleId,
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
            console.error('Failed to load capsule:', error);
            alert('Failed to load capsule. It may be corrupted or invalid.');
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
        
        // Add drag-to-reveal interaction
        this.setupDragToReveal();
    }
    
    setupDragToReveal() {
        const messageContainer = document.querySelector('.message-container');
        
        // Check if already has a cover
        if (messageContainer.querySelector('.draggable-cover')) {
            return;
        }
        
        // Create draggable cover
        const cover = document.createElement('div');
        cover.className = 'draggable-cover';
        cover.textContent = 'Drag to reveal message';
        messageContainer.appendChild(cover);
        
        // Drag interaction
        let isDragging = false;
        let startY, startTop;
        
        cover.addEventListener('mousedown', (e) => {
            isDragging = true;
            cover.classList.add('dragging');
            startY = e.clientY;
            startTop = 0;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaY = e.clientY - startY;
            const newTop = Math.max(0, Math.min(messageContainer.offsetHeight, startTop + deltaY));
            cover.style.height = `${messageContainer.offsetHeight - newTop}px`;
            
            // Remove cover if dragged more than 80% down
            if (newTop > messageContainer.offsetHeight * 0.8) {
                messageContainer.removeChild(cover);
                isDragging = false;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            cover.classList.remove('dragging');
            
            // Snap back to top or remove based on position
            const coverRect = cover.getBoundingClientRect();
            const containerRect = messageContainer.getBoundingClientRect();
            
            if (coverRect.top > containerRect.top + containerRect.height * 0.5) {
                messageContainer.removeChild(cover);
            } else {
                cover.style.height = '100%';
            }
        });
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