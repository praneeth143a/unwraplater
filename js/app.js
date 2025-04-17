/**
 * UnwrapLater Application
 * Main application file for the time capsule message service
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const previewBtn = document.getElementById('preview-btn');
    const backToEditBtn = document.getElementById('back-to-edit');
    const createCapsuleBtn = document.getElementById('create-capsule');
    const createNewBtn = document.getElementById('create-new');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Form Elements
    const messageInput = document.getElementById('message');
    const unlockDateInput = document.getElementById('unlock-date');
    const passphraseInput = document.getElementById('passphrase');
    const themeSelect = document.getElementById('theme-select');
    const themeOptions = document.querySelectorAll('.theme-option');
    const mediaUpload = document.getElementById('media-upload');
    const mediaPreview = document.getElementById('media-preview');
    const removeMediaBtn = document.getElementById('remove-media');
    
    // Add current date and time display
    const currentDateDisplay = document.createElement('div');
    currentDateDisplay.id = 'current-date-display';
    document.querySelector('header').appendChild(currentDateDisplay);
    
    // Function to update current date and time
    function updateCurrentDateTime() {
        const now = new Date();
        const formattedDateTime = now.toLocaleString(navigator.language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        });
        currentDateDisplay.textContent = formattedDateTime;
    }
    
    // Update date/time immediately and then every second
    updateCurrentDateTime();
    setInterval(updateCurrentDateTime, 1000);
    
    // Set current date and time for unlock date input
    const setCurrentDateTime = () => {
        const now = new Date();
        
        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const currentFormatted = `${year}-${month}-${day}T${hours}:${minutes}`;
        unlockDateInput.value = currentFormatted;
        unlockDateInput.min = '';  // Remove min date restriction
    }
    
    // Set the current date/time
    setCurrentDateTime();
    
    // Add a "Set to Current Time" button next to the date input
    const addCurrentTimeButton = () => {
        // Create the container
        const btnContainer = document.createElement('div');
        btnContainer.className = 'current-time-btn-container';
        
        // Create the button
        const currentTimeBtn = document.createElement('button');
        currentTimeBtn.type = 'button';
        currentTimeBtn.className = 'current-time-btn';
        currentTimeBtn.textContent = 'Set to Current Time';
        currentTimeBtn.title = 'Update to current date and time';
        
        // Add click event listener
        currentTimeBtn.addEventListener('click', () => {
            setCurrentDateTime();
        });
        
        // Add button to container
        btnContainer.appendChild(currentTimeBtn);
        
        // Insert after date input
        unlockDateInput.parentNode.insertBefore(btnContainer, unlockDateInput.nextSibling);
    }
    
    // Call the function to add the button
    addCurrentTimeButton();
    
    // Preview Elements
    const previewMessage = document.getElementById('preview-message');
    const previewDate = document.getElementById('preview-date');
    const previewPassphraseInfo = document.getElementById('preview-passphrase-info');
    const previewTheme = document.getElementById('preview-theme');
    const previewMediaContainer = document.getElementById('preview-media-container');
    const previewThemeDisplay = document.getElementById('preview-theme-display');
    
    // Sections
    const createSection = document.getElementById('create-section');
    const previewSection = document.getElementById('preview-section');
    const shareSection = document.getElementById('share-section');
    const unlockSection = document.getElementById('unlock-section');
    
    // Current media file
    let currentMediaFile = null;
    
    // Set up dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Store preference
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            themeOptions.forEach(o => o.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update hidden input
            themeSelect.value = option.dataset.theme;
        });
    });
    
    // Select the first theme by default
    themeOptions[0].classList.add('selected');
    
    // Media upload handling
    mediaUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Check file size (limit to 10MB per file)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > MAX_FILE_SIZE) {
                alert('File is too large. Maximum size is 10MB.');
                return;
            }
            
            currentMediaFile = file;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaPreview.innerHTML = '';
                mediaPreview.classList.remove('hidden');
                removeMediaBtn.classList.remove('hidden');
                
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    mediaPreview.appendChild(img);
                } else if (file.type.startsWith('audio/')) {
                    const audio = document.createElement('audio');
                    audio.src = e.target.result;
                    audio.controls = true;
                    
                    // Add a container with some styling for the audio player
                    const audioContainer = document.createElement('div');
                    audioContainer.className = 'audio-container';
                    
                    // Add an icon or waveform visualization
                    const audioIcon = document.createElement('div');
                    audioIcon.className = 'audio-icon';
                    audioIcon.innerHTML = '🎵';
                    
                    // Add file name
                    const audioName = document.createElement('div');
                    audioName.className = 'audio-name';
                    audioName.textContent = file.name;
                    
                    audioContainer.appendChild(audioIcon);
                    audioContainer.appendChild(audio);
                    audioContainer.appendChild(audioName);
                    mediaPreview.appendChild(audioContainer);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Remove media button
    removeMediaBtn.addEventListener('click', () => {
        mediaUpload.value = '';
        mediaPreview.innerHTML = '';
        mediaPreview.classList.add('hidden');
        removeMediaBtn.classList.add('hidden');
        currentMediaFile = null;
    });
    
    // Handle preview button click
    previewBtn.addEventListener('click', () => {
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Update preview elements
        previewMessage.textContent = messageInput.value;
        
        // Format date for display
        const unlockDate = new Date(unlockDateInput.value);
        previewDate.textContent = new Intl.DateTimeFormat(navigator.language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short'
        }).format(unlockDate);
        
        // Show passphrase info if provided
        previewPassphraseInfo.classList.toggle('hidden', !passphraseInput.value);
        
        // Show selected theme
        const selectedTheme = themeSelect.value;
        previewTheme.textContent = document.querySelector(`.theme-option[data-theme="${selectedTheme}"] .theme-name`).textContent;
        
        // Display theme preview animation
        previewThemeDisplay.innerHTML = '';
        const animationCanvas = document.getElementById('animation-canvas');
        animationCanvas.classList.remove('hidden');
        AnimationManager.playAnimation(selectedTheme, previewThemeDisplay);
        
        // Add media preview if available
        previewMediaContainer.innerHTML = '';
        if (currentMediaFile) {
            if (currentMediaFile.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(currentMediaFile);
                previewMediaContainer.appendChild(img);
            } else if (currentMediaFile.type.startsWith('audio/')) {
                const audioContainer = document.createElement('div');
                audioContainer.className = 'audio-container';
                
                const audioIcon = document.createElement('div');
                audioIcon.className = 'audio-icon';
                audioIcon.innerHTML = '🎵';
                
                const audio = document.createElement('audio');
                audio.src = URL.createObjectURL(currentMediaFile);
                audio.controls = true;
                
                const audioName = document.createElement('div');
                audioName.className = 'audio-name';
                audioName.textContent = currentMediaFile.name;
                
                audioContainer.appendChild(audioIcon);
                audioContainer.appendChild(audio);
                audioContainer.appendChild(audioName);
                previewMediaContainer.appendChild(audioContainer);
            }
        }
        
        // Show preview section
        createSection.classList.remove('active-section');
        createSection.classList.add('hidden-section');
        previewSection.classList.remove('hidden-section');
        previewSection.classList.add('active-section');
    });
    
    // Handle back to edit button
    backToEditBtn.addEventListener('click', () => {
        // Stop animations
        AnimationManager.stopAnimation();
        
        // Hide preview section, show create section
        previewSection.classList.remove('active-section');
        previewSection.classList.add('hidden-section');
        createSection.classList.remove('hidden-section');
        createSection.classList.add('active-section');
    });
    
    /**
     * Simple QR Code Generator (basic implementation)
     * @param {string} text - Text to encode
     * @param {HTMLElement} container - Container to append QR code to
     * @param {Object} options - Options for QR code
     * @returns {HTMLCanvasElement|null} Canvas element if successful
     */
    const generateSimpleQR = (text, container, options = {}) => {
        if (!text || !container) return null;
        
        try {
            // Clear container
            container.innerHTML = '';
            
            // Default options
            const opts = {
                size: options.size || 200,
                color: options.colorDark || '#000000',
                bgColor: options.colorLight || '#FFFFFF'
            };
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = opts.size;
            canvas.height = opts.size;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = opts.bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Create a simplified pattern (not a real QR code, just for display)
            ctx.fillStyle = opts.color;
            
            // Draw position markers (corners)
            const markerSize = Math.floor(opts.size * 0.2);
            
            // Top-left marker
            drawPositionMarker(ctx, 0, 0, markerSize, opts.color, opts.bgColor);
            // Top-right marker
            drawPositionMarker(ctx, opts.size - markerSize, 0, markerSize, opts.color, opts.bgColor);
            // Bottom-left marker
            drawPositionMarker(ctx, 0, opts.size - markerSize, markerSize, opts.color, opts.bgColor);
            
            // Generate a pseudo-random pattern based on text
            const cellSize = Math.floor((opts.size - 2 * markerSize) / 20);
            const offset = markerSize;
            
            // Simple hash for the text
            let hash = 0;
            for (let i = 0; i < text.length; i++) {
                hash = ((hash << 5) - hash) + text.charCodeAt(i);
                hash = hash & hash;
            }
            
            // Seed random with hash
            const random = seededRandom(hash);
            
            // Fill cells
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 20; x++) {
                    // Skip the areas where markers are
                    if ((x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)) {
                        continue;
                    }
                    
                    // 40% chance to fill a cell
                    if (random() < 0.4) {
                        ctx.fillRect(
                            offset + x * cellSize, 
                            offset + y * cellSize, 
                            cellSize, 
                            cellSize
                        );
                    }
                }
            }
            
            // Add canvas to container
            container.appendChild(canvas);
            return canvas;
        } catch (error) {
            console.error('Error generating simple QR code:', error);
            return null;
        }
    };
    
    /**
     * Draw position marker for QR code
     * @private
     */
    const drawPositionMarker = (ctx, x, y, size, color, bgColor) => {
        // Outer square
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        
        // Inner square
        ctx.fillStyle = bgColor;
        const innerSize = Math.floor(size * 0.7);
        const innerOffset = Math.floor((size - innerSize) / 2);
        ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
        
        // Center square
        ctx.fillStyle = color;
        const centerSize = Math.floor(size * 0.3);
        const centerOffset = Math.floor((size - centerSize) / 2);
        ctx.fillRect(x + centerOffset, y + centerOffset, centerSize, centerSize);
    };
    
    /**
     * Simple seeded random function
     * @private
     */
    const seededRandom = (seed) => {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    };
    
    /**
     * Download a canvas as an image
     * @param {HTMLCanvasElement} canvas - Canvas to download
     * @param {string} filename - Filename for download
     */
    const downloadCanvasAsImage = (canvas, filename) => {
        if (!canvas) return;
        
        try {
            // Create a temporary link element
            const link = document.createElement('a');
            link.download = filename;
            
            // Convert canvas to data URL
            link.href = canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
        } catch (error) {
            console.error('Error downloading canvas:', error);
        }
    };
    
    /**
     * Generate a scannable QR code using QRCode.js library
     * @param {string} text - Text to encode in QR code
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Options for QR code
     * @returns {Object} QR code object with download methods
     */
    const generateQRCode = (text, container, options = {}) => {
        if (!text || !container) return null;
        
        try {
            // Clear container
            container.innerHTML = '';
            
            // Default options
            const opts = {
                text: text,
                width: options.size || 200,
                height: options.size || 200,
                colorDark: options.colorDark || '#000000',
                colorLight: options.colorLight || '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.H // High error correction
            };
            
            // Check if QRCode library is available
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not found, falling back to simple implementation');
                return generateSimpleQR(text, container, options);
            }
            
            // Create QR code in container
            const qrcode = new QRCode(container, opts);
            
            // Return object with original QR code and methods
            return {
                qrcode: qrcode,
                download: (filename) => {
                    // Get the canvas or image from the container
                    const canvas = container.querySelector('canvas');
                    const image = container.querySelector('img');
                    
                    if (canvas) {
                        // If canvas is available, use it directly
                        downloadCanvasAsImage(canvas, filename);
                    } else if (image) {
                        // If only image is available, create canvas from image
                        const canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0, image.width, image.height);
                        downloadCanvasAsImage(canvas, filename);
                    }
                }
            };
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    };
    
    // Handle create capsule button
    createCapsuleBtn.addEventListener('click', () => {
        // Stop animations before proceeding
        AnimationManager.stopAnimation();
        
        // Create the capsule object
        const capsule = {
            id: CryptoUtil.generateId(),
            message: messageInput.value,
            unlockDate: unlockDateInput.value,
            theme: themeSelect.value,
            hasPassphrase: !!passphraseInput.value,
            createdAt: new Date().toISOString()
        };
        
        // If passphrase is provided, encrypt it
        if (passphraseInput.value) {
            // Use our encryption utility
            capsule.passphrase = CryptoUtil.encrypt(passphraseInput.value, passphraseInput.value);
        }
        
        // Store the capsule
        StorageUtil.saveCapsule(capsule);
        
        // Save media if exists
        if (currentMediaFile) {
            MediaUtil.fileToDataUrl(currentMediaFile).then(dataUrl => {
                StorageUtil.saveMedia(capsule.id, {
                    type: currentMediaFile.type,
                    data: dataUrl
                });
            }).catch(error => {
                console.error('Failed to save media:', error);
            });
        }
        
        // Generate share link
        const shareLink = `${window.location.origin}${window.location.pathname}?capsule=${capsule.id}`;
        document.getElementById('capsule-link').value = shareLink;
        
        // Generate QR code
        try {
            const qrContainer = document.getElementById('qr-code');
            if (qrContainer) {
                // Clear any previous content
                qrContainer.innerHTML = '';
                
                let qrObject = null;
                
                // Try to use the QRCode.js library first
                if (typeof QRCode !== 'undefined') {
                    qrObject = generateQRCode(shareLink, qrContainer, {
                        size: 200,
                        colorDark: '#8e44ad'
                    });
                } 
                // Then try Helpers if available
                else if (typeof Helpers !== 'undefined' && Helpers.generateQRCode) {
                    const qrCanvas = Helpers.generateQRCode(shareLink, qrContainer, {
                        size: 200,
                        colorDark: '#8e44ad'
                    });
                    qrObject = {
                        download: (filename) => {
                            if (typeof Helpers.downloadCanvas === 'function') {
                                Helpers.downloadCanvas(qrCanvas, filename);
                            } else {
                                downloadCanvasAsImage(qrCanvas, filename);
                            }
                        }
                    };
                } 
                // Fall back to simple implementation
                else {
                    const qrCanvas = generateSimpleQR(shareLink, qrContainer, {
                        size: 200,
                        colorDark: '#8e44ad'
                    });
                    qrObject = {
                        download: (filename) => {
                            downloadCanvasAsImage(qrCanvas, filename);
                        }
                    };
                }
                
                // Setup download QR code button
                const downloadQrBtn = document.getElementById('download-qr');
                if (downloadQrBtn) {
                    // Remove any existing event listeners
                    const newDownloadBtn = downloadQrBtn.cloneNode(true);
                    downloadQrBtn.parentNode.replaceChild(newDownloadBtn, downloadQrBtn);
                    
                    if (qrObject) {
                        // Add event listener for download
                        newDownloadBtn.addEventListener('click', () => {
                            qrObject.download(`unwraplater-qr-${capsule.id}.png`);
                        });
                    } else {
                        // Hide or disable the download button if no QR is available
                        newDownloadBtn.style.display = 'none';
                    }
                }
            } else {
                console.error('QR code container not found');
            }
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
        
        // Hide preview section, show share section
        previewSection.classList.remove('active-section');
        previewSection.classList.add('hidden-section');
        shareSection.classList.remove('hidden-section');
        shareSection.classList.add('active-section');
    });
    
    // Handle create new capsule button
    createNewBtn.addEventListener('click', () => {
        // Reset form
        document.getElementById('capsule-form').reset();
        mediaPreview.innerHTML = '';
        mediaPreview.classList.add('hidden');
        removeMediaBtn.classList.add('hidden');
        currentMediaFile = null;
        
        // Reset date input to current date/time
        setCurrentDateTime();
        
        // Reset theme selection
        themeOptions.forEach(o => o.classList.remove('selected'));
        themeOptions[0].classList.add('selected');
        themeSelect.value = themeOptions[0].dataset.theme;
        
        // Hide share section, show create section
        shareSection.classList.remove('active-section');
        shareSection.classList.add('hidden-section');
        createSection.classList.remove('hidden-section');
        createSection.classList.add('active-section');
    });
    
    // Copy link button
    document.getElementById('copy-link').addEventListener('click', () => {
        const linkInput = document.getElementById('capsule-link');
        linkInput.select();
        document.execCommand('copy');
        
        // Show copied notification
        alert('Link copied to clipboard!');
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const errorMessages = document.querySelectorAll('.error-message');
        
        // Remove any existing error messages
        errorMessages.forEach(msg => msg.remove());
        
        // Check message
        if (!messageInput.value.trim()) {
            messageInput.classList.add('error');
            addErrorMessage(messageInput, 'Please enter a message');
            isValid = false;
        } else {
            messageInput.classList.remove('error');
        }
        
        // Check date and time
        if (!unlockDateInput.value) {
            unlockDateInput.classList.add('error');
            addErrorMessage(unlockDateInput, 'Please select a date and time');
            isValid = false;
        } else {
            unlockDateInput.classList.remove('error');
        }
        
        return isValid;
    }
    
    // Helper function to add error messages
    function addErrorMessage(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }
    
    // Check URL for capsule parameter
    function checkUrlForCapsule() {
        const urlParams = new URLSearchParams(window.location.search);
        const capsuleId = urlParams.get('capsule');
        
        if (capsuleId) {
            openCapsule(capsuleId);
        }
    }
    
    // Open a capsule
    function openCapsule(capsuleId) {
        // Get capsule from storage
        const capsule = StorageUtil.getCapsule(capsuleId);
        
        if (!capsule) {
            alert('Capsule not found!');
            return;
        }
        
        // Hide all sections and show unlock section
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        });
        
        unlockSection.classList.remove('hidden-section');
        unlockSection.classList.add('active-section');
        
        // Set unlock date display
        const unlockDate = new Date(capsule.unlockDate);
        document.getElementById('unlock-date-display').textContent = new Intl.DateTimeFormat(navigator.language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short'
        }).format(unlockDate);
        
        // Set up unlock now button event
        document.getElementById('unlock-now').addEventListener('click', () => {
            if (capsule.hasPassphrase) {
                document.getElementById('passphrase-container').classList.remove('hidden');
                document.getElementById('unlock-now-container').classList.add('hidden');
            } else {
                unlockCapsule(capsule);
            }
        });
        
        // Check if the capsule can be unlocked
        const now = new Date();
        
        // Compare current date with unlock date
        const canUnlock = now >= unlockDate;
        
        if (canUnlock) {
            // If passphrase is required, show input
            if (capsule.hasPassphrase) {
                document.getElementById('passphrase-container').classList.remove('hidden');
                document.getElementById('time-remaining').classList.add('hidden');
                
                // Set up passphrase validation
                document.getElementById('submit-passphrase').addEventListener('click', () => {
                    const enteredPassphrase = document.getElementById('enter-passphrase').value;
                    
                    // Use our decryption utility to verify passphrase
                    const isValid = CryptoUtil.decrypt(capsule.passphrase, enteredPassphrase) !== null;
                    
                    if (enteredPassphrase && isValid) {
                        unlockCapsule(capsule);
                    } else {
                        document.getElementById('passphrase-error').classList.remove('hidden');
                    }
                });
            } else {
                // No passphrase, unlock immediately
                unlockCapsule(capsule);
            }
        } else {
            // Show countdown
            document.getElementById('passphrase-container').classList.add('hidden');
            document.getElementById('time-remaining').classList.remove('hidden');
            
            // Update countdown
            updateCountdown(unlockDate);
            // Set interval to update countdown
            const countdownInterval = setInterval(() => {
                // Return value indicates if countdown is finished
                const isFinished = updateCountdown(unlockDate);
                if (isFinished) {
                    clearInterval(countdownInterval);
                    // Allow unlocking now
                    if (capsule.hasPassphrase) {
                        document.getElementById('passphrase-container').classList.remove('hidden');
                        document.getElementById('time-remaining').classList.add('hidden');
                    } else {
                        unlockCapsule(capsule);
                    }
                }
            }, 1000);
        }
    }
    
    // Update countdown display
    function updateCountdown(unlockDate) {
        const now = new Date();
        const timeRemaining = unlockDate - now;
        
        if (timeRemaining <= 0) {
            // Time's up, show unlock interface instead of reloading
            document.getElementById('time-remaining').classList.add('hidden');
            document.getElementById('unlock-message').textContent = "This capsule is now ready to open!";
            
            // Show the unlock now button
            const unlockNowContainer = document.getElementById('unlock-now-container');
            unlockNowContainer.classList.remove('hidden');
            
            return true;
        }
        
        // Calculate remaining time units
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Update display
        document.getElementById('days-remaining').textContent = days;
        document.getElementById('hours-remaining').textContent = hours;
        document.getElementById('minutes-remaining').textContent = minutes;
        document.getElementById('seconds-remaining').textContent = seconds;
        
        return false;
    }
    
    // Unlock and reveal capsule content
    function unlockCapsule(capsule) {
        // Hide locked container, show unlocked container
        document.getElementById('locked-container').classList.add('hidden');
        document.getElementById('unlocked-container').classList.remove('hidden');
        
        // Set message content
        const messageReveal = document.getElementById('message-reveal');
        messageReveal.textContent = capsule.message;
        
        // Apply theme to message container
        if (typeof ThemeService !== 'undefined' && ThemeService.applyMessageTheme) {
            ThemeService.applyMessageTheme(capsule.theme, document.getElementById('unlocked-container'));
        }
        
        // Get animation container
        const animationContainer = document.getElementById('theme-animation-container');
        
        // Play animation with theme
        AnimationManager.playAnimation(capsule.theme, animationContainer);
        
        // Load media if exists
        const capsuleMedia = StorageUtil.getMedia(capsule.id);
        
        if (capsuleMedia) {
            const mediaReveal = document.getElementById('media-reveal');
            mediaReveal.classList.remove('hidden');
            
            if (capsuleMedia.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = capsuleMedia.data;
                mediaReveal.appendChild(img);
            } else if (capsuleMedia.type.startsWith('audio/')) {
                const audioContainer = document.createElement('div');
                audioContainer.className = 'audio-container';
                
                const audioIcon = document.createElement('div');
                audioIcon.className = 'audio-icon';
                audioIcon.innerHTML = '🎵';
                
                const audio = document.createElement('audio');
                audio.src = capsuleMedia.data;
                audio.controls = true;
                
                const audioName = document.createElement('div');
                audioName.className = 'audio-name';
                audioName.textContent = 'Audio Message';
                
                audioContainer.appendChild(audioIcon);
                audioContainer.appendChild(audio);
                audioContainer.appendChild(audioName);
                mediaReveal.appendChild(audioContainer);
            }
        }
        
        // Set up download memory button
        document.getElementById('download-memory').addEventListener('click', () => {
            // Generate a readable, SEO-friendly filename
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            const filename = `unwraplater-memory-${formattedDate}.html`;
            
            // Generate the memory HTML content
            const htmlContent = Helpers.generateMemoryFile(capsule, capsuleMedia, capsule.theme);
            
            // Download the file
            Helpers.downloadFile(htmlContent, filename, 'text/html');
        });
        
        // Set up create response button
        document.getElementById('create-response').addEventListener('click', () => {
            // Stop animation
            AnimationManager.stopAnimation();
            
            // Hide all sections, show create section
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active-section');
                section.classList.add('hidden-section');
            });
            
            createSection.classList.remove('hidden-section');
            createSection.classList.add('active-section');
        });
    }
    
    // Check for capsule ID in URL on page load
    checkUrlForCapsule();
    
    // Add event listener for date validation
    unlockDateInput.addEventListener('change', () => {
        validateDateInput();
    });
    
    // Function to validate just the date input
    function validateDateInput() {
        // Remove any existing error messages for this field
        const errorMessages = unlockDateInput.parentNode.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        if (!unlockDateInput.value) {
            unlockDateInput.classList.add('error');
            addErrorMessage(unlockDateInput, 'Please select a date and time');
            return false;
        } else {
            unlockDateInput.classList.remove('error');
            return true;
        }
    }
});
