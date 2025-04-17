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
    
    /**
     * Set current date/time in the date input
     */
    const setCurrentDateTime = () => {
        const now = new Date();
        
        // Format date as ISO string like 2023-03-15T14:30
        // This format works with datetime-local input
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        unlockDateInput.value = formattedDate;
    };
    
    // Set current date/time on page load
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
        
        // Get theme information
        let selectedTheme = themeSelect.value;
        let customAnimation = null;
        let customColor = null;
        
        // If custom theme is selected, handle the animation type
        if (selectedTheme === 'custom') {
            customColor = customColorPicker ? customColorPicker.value : '#0078d7';
            
            if (customAnimationSelect) {
                customAnimation = customAnimationSelect.value;
                
                // If random is selected, choose a random animation for preview
                if (customAnimation === 'random') {
                    customAnimation = getRandomAnimation();
                }
            }
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
        const themeName = document.querySelector(`.theme-option[data-theme="${selectedTheme}"] .theme-name`).textContent;
        previewTheme.textContent = selectedTheme === 'custom' ? `${themeName} (${customAnimation})` : themeName;
        
        // Apply custom theme colors to preview if selected
        if (selectedTheme === 'custom' && customColor) {
            previewThemeDisplay.style.background = `linear-gradient(135deg, ${customColor} 0%, ${adjustColor(customColor, 20)} 100%)`;
            previewThemeDisplay.style.opacity = '0.2';
        } else {
            previewThemeDisplay.style.background = '';
            previewThemeDisplay.style.opacity = '';
        }
        
        // Display theme preview animation
        previewThemeDisplay.innerHTML = '';
        const animationCanvas = document.getElementById('animation-canvas');
        animationCanvas.classList.remove('hidden');
        
        // Use the selected animation for custom theme
        if (selectedTheme === 'custom' && customAnimation) {
            AnimationManager.playAnimation(customAnimation, previewThemeDisplay, true, customColor);
        } else {
            AnimationManager.playAnimation(selectedTheme, previewThemeDisplay);
        }
        
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
    
    // Handle create capsule button
    createCapsuleBtn.addEventListener('click', () => {
        // Stop animations before proceeding
        AnimationManager.stopAnimation();
        
        // Get theme information
        let selectedTheme = themeSelect.value;
        let customAnimation = null;
        
        // If custom theme is selected, handle the animation type
        if (selectedTheme === 'custom' && customAnimationSelect) {
            customAnimation = customAnimationSelect.value;
            
            // If random is selected, choose a random animation
            if (customAnimation === 'random') {
                customAnimation = getRandomAnimation();
            }
        }
        
        // Create the capsule object
        const capsule = {
            id: CryptoUtil.generateId(),
            message: messageInput.value,
            unlockDate: unlockDateInput.value,
            theme: selectedTheme,
            customAnimation: customAnimation, // Store the custom animation type
            customColor: selectedTheme === 'custom' ? customColorPicker.value : null,
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
        
        // Set up social sharing buttons
        setupSocialSharing(shareLink, capsule);
        
        // Hide preview section, show share section
        previewSection.classList.remove('active-section');
        previewSection.classList.add('hidden-section');
        shareSection.classList.remove('hidden-section');
        shareSection.classList.add('active-section');
    });
    
    /**
     * Set up social sharing functionality
     * @param {string} shareUrl - URL to be shared
     * @param {Object} capsule - Capsule object with message and details
     */
    function setupSocialSharing(shareUrl, capsule) {
        // Create share text with message preview (truncated)
        const messagePreview = capsule.message.length > 30 
            ? capsule.message.substring(0, 30) + '...' 
            : capsule.message;
        
        const shareTitle = 'Check out my UnwrapLater time capsule!';
        const shareText = `${shareTitle} It will unlock on ${new Date(capsule.unlockDate).toLocaleDateString()}`;
        
        // WhatsApp Share
        const whatsappBtn = document.getElementById('share-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                window.open(whatsappUrl, '_blank');
            });
        }
        
        // Facebook Share
        const facebookBtn = document.getElementById('share-facebook');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                window.open(facebookUrl, '_blank');
            });
        }
        
        // Twitter Share
        const twitterBtn = document.getElementById('share-twitter');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                window.open(twitterUrl, '_blank');
            });
        }
        
        // Email Share
        const emailBtn = document.getElementById('share-email');
        if (emailBtn) {
            emailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const subject = encodeURIComponent(shareTitle);
                const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            });
        }
        
        // SMS Share
        const smsBtn = document.getElementById('share-sms');
        if (smsBtn) {
            smsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const smsText = encodeURIComponent(`${shareText} ${shareUrl}`);
                window.location.href = `sms:?body=${smsText}`;
            });
        }
    }
    
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
    
    // Download capsule button
    document.getElementById('download-capsule').addEventListener('click', () => {
        // Get the capsule ID from the link
        const linkInput = document.getElementById('capsule-link');
        const url = new URL(linkInput.value);
        const capsuleId = url.searchParams.get('capsule');
        
        if (capsuleId) {
            // Get the capsule data
            const capsule = StorageUtil.getCapsule(capsuleId);
            const capsuleMedia = StorageUtil.getMedia(capsuleId);
            
            if (capsule) {
                // Generate a readable, SEO-friendly filename
                const date = new Date();
                const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                const filename = `unwraplater-capsule-${formattedDate}.html`;
                
                // Generate the memory HTML content
                const htmlContent = Helpers.generateMemoryFile(capsule, capsuleMedia, capsule.theme);
                
                // Download the file
                Helpers.downloadFile(htmlContent, filename, 'text/html');
            } else {
                alert('Capsule not found in storage.');
            }
        } else {
            alert('Could not find capsule ID in the share link.');
        }
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
    
    // Custom theme handling
    const customThemeOption = document.querySelector('.theme-option[data-theme="custom"]');
    const customThemeOptions = document.getElementById('custom-theme-options');
    const customColorPicker = document.getElementById('custom-color');
    const customThemePreview = document.querySelector('.custom-theme-preview');
    const customAnimationSelect = document.getElementById('custom-animation');
    
    if (customThemeOption && customThemeOptions) {
        // Hide custom options initially
        customThemeOptions.style.display = 'none';
        
        // Show custom options when custom theme is selected
        customThemeOption.addEventListener('click', () => {
            setTimeout(() => {
                customThemeOptions.style.display = 'block';
                
                // Set blue as default color when custom is selected
                if (customColorPicker) {
                    customColorPicker.value = '#0078d7'; // Microsoft blue
                    updateCustomThemePreview('#0078d7');
                }
                
                // Set animation to random by default
                if (customAnimationSelect) {
                    customAnimationSelect.value = 'random';
                }
            }, 150);
        });
        
        // Hide custom options when other themes are selected
        document.querySelectorAll('.theme-option:not([data-theme="custom"])').forEach(option => {
            option.addEventListener('click', () => {
                customThemeOptions.style.display = 'none';
            });
        });
        
        // Update custom theme preview when color is changed
        if (customColorPicker) {
            customColorPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                updateCustomThemePreview(color);
            });
            
            // Initialize with a default blue color
            customColorPicker.value = '#0078d7';
            updateCustomThemePreview('#0078d7');
        }
    }
    
    /**
     * Update the custom theme preview with the selected color
     * @param {string} color - Hex color value
     */
    function updateCustomThemePreview(color) {
        if (customThemePreview) {
            customThemePreview.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, 20)} 100%)`;
            
            // Also update the custom theme option background
            if (customThemeOption) {
                customThemeOption.style.borderColor = color;
                customThemeOption.style.boxShadow = `0 0 0 2px ${adjustColor(color, -20)}`;
                
                // Add a subtle background
                const bgColor = adjustColor(color, 90); // Much lighter version for background
                customThemeOption.style.background = bgColor;
            }
        }
    }
    
    /**
     * Get a random animation type for custom theme
     * @returns {string} Random animation type
     */
    function getRandomAnimation() {
        const animations = ['hearts', 'stars', 'confetti', 'bubbles', 'sparkles', 'fireworks'];
        const randomIndex = Math.floor(Math.random() * animations.length);
        return animations[randomIndex];
    }
});

/**
 * Adjusts a hex color by the specified percent
 * @param {string} color - The hex color to adjust
 * @param {number} percent - Percent to lighten (positive) or darken (negative)
 * @returns {string} - The adjusted hex color
 */
function adjustColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

/**
 * Check if the media size exceeds recommended limits and show a warning if needed
 * @param {number} mediaSize - Size of the media in bytes
 */
function checkStorageLimit(mediaSize) {
    const MAX_RECOMMENDED_SIZE = 5 * 1024 * 1024; // 5MB
    
    if (mediaSize > MAX_RECOMMENDED_SIZE) {
        const container = document.querySelector('.media-upload-container');
        
        // Create warning element if it doesn't exist
        if (!document.querySelector('.storage-warning')) {
            const warningEl = document.createElement('div');
            warningEl.className = 'storage-warning';
            warningEl.innerHTML = `
                <div class="warning-icon">⚠️</div>
                <div class="warning-message">
                    <p>The media you've attached is large (${formatFileSize(mediaSize)}) and may consume significant storage space.</p>
                    <button class="optimize-btn">Optimize Media</button>
                </div>
            `;
            
            // Add optimize media handler
            setTimeout(() => {
                const optimizeBtn = warningEl.querySelector('.optimize-btn');
                if (optimizeBtn) {
                    optimizeBtn.addEventListener('click', optimizeMedia);
                }
            }, 0);
            
            // Insert warning after the media container
            container.parentNode.insertBefore(warningEl, container.nextSibling);
        }
    }
}

/**
 * Optimize media by compressing images and reducing quality
 */
function optimizeMedia() {
    const mediaInput = document.getElementById('media-upload');
    const files = mediaInput.files;
    
    if (files && files.length > 0) {
        // Create an optimized file list
        const optimizedFiles = new DataTransfer();
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                // Compress images
                compressImage(file).then(compressedFile => {
                    optimizedFiles.items.add(compressedFile);
                    updateMediaPreview(optimizedFiles.files);
                });
            } else {
                // Keep non-image files as is
                optimizedFiles.items.add(file);
            }
        });
        
        // Remove the warning message
        const warningEl = document.querySelector('.storage-warning');
        if (warningEl) {
            warningEl.remove();
        }
    }
}

/**
 * Compress an image file to reduce its size
 * @param {File} imageFile - The image file to compress
 * @returns {Promise<File>} - Promise resolving to the compressed file
 */
function compressImage(imageFile) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // Create a canvas to draw the compressed image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set max dimensions (reduce if large)
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw the image on the canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with reduced quality
                canvas.toBlob(blob => {
                    // Create a new File from the blob
                    const compressedFile = new File([blob], imageFile.name, {
                        type: 'image/jpeg',
                        lastModified: new Date().getTime()
                    });
                    
                    // Show compression results
                    console.log(`Compressed ${imageFile.name} from ${formatFileSize(imageFile.size)} to ${formatFileSize(compressedFile.size)}`);
                    
                    resolve(compressedFile);
                }, 'image/jpeg', 0.7); // 70% quality
            };
        };
    });
}

/**
 * Asynchronously encrypt a password using Web Crypto API
 * @param {string} password - The password to encrypt
 * @returns {Promise<string>} - Promise resolving to encrypted password
 */
async function encryptPassword(password) {
    // Convert password string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Generate a secure salt
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Derive a key using PBKDF2
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        data,
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    
    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt"]
    );
    
    // Store the salt and key for later verification
    const saltBase64 = btoa(String.fromCharCode(...salt));
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    
    return JSON.stringify({ salt: saltBase64, key: keyBase64 });
}

/**
 * Verify a password against the stored encrypted password
 * @param {string} inputPassword - The password to verify
 * @param {string} storedPassword - The stored encrypted password
 * @returns {Promise<boolean>} - Promise resolving to whether the password is correct
 */
async function verifyPassword(inputPassword, storedPassword) {
    try {
        const { salt: saltBase64, key: keyBase64 } = JSON.parse(storedPassword);
        
        // Decode the stored salt and key
        const saltString = atob(saltBase64);
        const salt = new Uint8Array(saltString.length);
        for (let i = 0; i < saltString.length; i++) {
            salt[i] = saltString.charCodeAt(i);
        }
        
        const keyString = atob(keyBase64);
        const storedKeyData = new Uint8Array(keyString.length);
        for (let i = 0; i < keyString.length; i++) {
            storedKeyData[i] = keyString.charCodeAt(i);
        }
        
        // Derive a key from the input password using the same parameters
        const encoder = new TextEncoder();
        const inputData = encoder.encode(inputPassword);
        
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            inputData,
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt"]
        );
        
        const derivedKeyData = await window.crypto.subtle.exportKey("raw", derivedKey);
        const derivedKeyArray = new Uint8Array(derivedKeyData);
        
        // Compare the derived key with the stored key
        if (derivedKeyArray.length !== storedKeyData.length) {
            return false;
        }
        
        for (let i = 0; i < derivedKeyArray.length; i++) {
            if (derivedKeyArray[i] !== storedKeyData[i]) {
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}
