/**
 * Theme Service
 * Manages themes for the UnwrapLater app
 */
const ThemeService = (() => {
    // Available themes
    const THEMES = {
        love: {
            name: 'Love',
            icon: '💖',
            primaryColor: '#FF6B81',
            secondaryColor: '#FFB8C5',
            backgroundColor: '#FFF5F7',
            fontColor: '#333333',
            animations: ['hearts', 'fadeIn'],
            soundEffect: 'love.mp3',
            messageStyle: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: '1.2em',
                lineHeight: '1.6',
                fontWeight: '400'
            },
            description: 'Express your love with hearts and gentle animations'
        },
        bestFriends: {
            name: 'Best Friends',
            icon: '🤝',
            primaryColor: '#7986CB',
            secondaryColor: '#A5B4FC',
            backgroundColor: '#F5F7FF',
            fontColor: '#333333',
            animations: ['stars', 'fadeIn'],
            soundEffect: 'friendship.mp3',
            messageStyle: {
                fontFamily: 'Comic Sans MS, cursive',
                fontSize: '1.15em',
                lineHeight: '1.5',
                fontWeight: '400'
            },
            description: 'Celebrate friendship with playful animations'
        },
        birthday: {
            name: 'Birthday',
            icon: '🎂',
            primaryColor: '#FFD54F',
            secondaryColor: '#FFECB3',
            backgroundColor: '#FFFBF2',
            fontColor: '#5D4037',
            animations: ['confetti', 'fadeIn'],
            soundEffect: 'birthday.mp3',
            messageStyle: {
                fontFamily: 'Fredoka One, cursive',
                fontSize: '1.2em',
                lineHeight: '1.4',
                fontWeight: '400'
            },
            description: 'Perfect for birthday wishes with festive animations'
        },
        motivational: {
            name: 'Motivational',
            icon: '🌟',
            primaryColor: '#66BB6A',
            secondaryColor: '#C8E6C9',
            backgroundColor: '#F3FFF4',
            fontColor: '#1B5E20',
            animations: ['sunrise', 'fadeIn'],
            soundEffect: 'motivation.mp3',
            messageStyle: {
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1.1em',
                lineHeight: '1.7',
                fontWeight: '500'
            },
            description: 'Inspire with uplifting animations and colors'
        },
        celebration: {
            name: 'Celebration',
            icon: '🎉',
            primaryColor: '#42A5F5',
            secondaryColor: '#BBDEFB',
            backgroundColor: '#F0F8FF',
            fontColor: '#0D47A1',
            animations: ['confetti', 'zoomIn'],
            soundEffect: 'celebration.mp3',
            messageStyle: {
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.15em',
                lineHeight: '1.5',
                fontWeight: '400'
            },
            description: 'Celebrate special moments with joyful animations'
        }
    };
    
    // Current app theme (dark/light)
    let currentAppTheme = 'light';
    
    /**
     * Get all available themes
     * @returns {Object} Themes object
     */
    const getAllThemes = () => {
        return { ...THEMES };
    };
    
    /**
     * Get theme by ID
     * @param {string} themeId - Theme ID
     * @returns {Object} Theme object
     */
    const getTheme = (themeId) => {
        return THEMES[themeId] || THEMES.love; // Default to love theme
    };
    
    /**
     * Get theme IDs as an array
     * @returns {Array} Array of theme IDs
     */
    const getThemeIds = () => {
        return Object.keys(THEMES);
    };
    
    /**
     * Apply a message theme to a container
     * @param {string} themeId - Theme ID
     * @param {HTMLElement} container - Container to apply theme to
     */
    const applyMessageTheme = (themeId, container) => {
        if (!container) return;
        
        const theme = getTheme(themeId);
        
        // Clear existing theme classes
        getThemeIds().forEach(id => {
            container.classList.remove(`theme-${id}`);
        });
        
        // Add new theme class
        container.classList.add(`theme-${themeId}`);
        
        // Apply theme colors and styles via data attribute
        container.setAttribute('data-capsule-theme', themeId);
        
        // Apply specific styles if needed
        if (theme.messageStyle) {
            Object.keys(theme.messageStyle).forEach(key => {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase(); // camelCase to kebab-case
                container.style.setProperty(`--message-${cssKey}`, theme.messageStyle[key]);
            });
        }
    };
    
    /**
     * Apply an animation based on theme
     * @param {string} themeId - Theme ID
     * @param {HTMLElement} container - Container for animation
     * @returns {Promise} Promise that resolves when animation is complete
     */
    const playThemeAnimation = async (themeId, container) => {
        if (!container) return;
        
        const theme = getTheme(themeId);
        
        try {
            // Call animation module
            if (typeof AnimationManager !== 'undefined' && AnimationManager.playAnimation) {
                return AnimationManager.playAnimation(themeId, container);
            } else {
                console.warn('AnimationManager not available');
                // Apply simple animation fallback
                container.style.animation = 'fadeIn 1s ease-in-out';
                return Promise.resolve();
            }
        } catch (error) {
            console.error('Error playing theme animation:', error);
            return Promise.reject(error);
        }
    };
    
    /**
     * Stop current animation
     */
    const stopThemeAnimation = () => {
        if (typeof AnimationManager !== 'undefined' && AnimationManager.stopAnimation) {
            AnimationManager.stopAnimation();
        }
    };
    
    /**
     * Set application theme (dark/light)
     * @param {string} theme - 'dark' or 'light'
     */
    const setAppTheme = (theme) => {
        if (theme !== 'dark' && theme !== 'light') {
            console.warn(`Invalid theme: ${theme}. Must be 'dark' or 'light'`);
            return;
        }
        
        const htmlElement = document.documentElement;
        
        // Remove previous theme
        htmlElement.removeAttribute('data-theme');
        
        // Set new theme
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
        }
        
        // Update current theme
        currentAppTheme = theme;
        
        // Save preference
        try {
            Storage.set('app_theme', theme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
        
        // Publish event
        EventBus.publish(EventBus.EVENTS.THEME_CHANGED, { theme });
    };
    
    /**
     * Get current application theme
     * @returns {string} 'dark' or 'light'
     */
    const getAppTheme = () => {
        return currentAppTheme;
    };
    
    /**
     * Toggle between dark and light theme
     * @returns {string} New theme
     */
    const toggleAppTheme = () => {
        const newTheme = currentAppTheme === 'dark' ? 'light' : 'dark';
        setAppTheme(newTheme);
        return newTheme;
    };
    
    /**
     * Initialize theme service
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    const init = async () => {
        try {
            // Load saved theme preference
            const savedTheme = await Storage.get('app_theme');
            
            if (savedTheme) {
                // Apply saved theme
                setAppTheme(savedTheme);
            } else {
                // Check for system preference
                const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setAppTheme(prefersDarkScheme ? 'dark' : 'light');
            }
            
            // Set up listeners for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                const newTheme = e.matches ? 'dark' : 'light';
                setAppTheme(newTheme);
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing theme service:', error);
            return false;
        }
    };
    
    /**
     * Generate theme selection UI
     * @param {HTMLElement} container - Container to add theme options to
     * @param {string} selectedTheme - Currently selected theme
     * @param {Function} onSelect - Callback when theme is selected
     */
    const generateThemeSelector = (container, selectedTheme = 'love', onSelect) => {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create theme options
        Object.keys(THEMES).forEach(themeId => {
            const theme = THEMES[themeId];
            
            const themeOption = document.createElement('div');
            themeOption.className = 'theme-option';
            themeOption.dataset.theme = themeId;
            
            if (themeId === selectedTheme) {
                themeOption.classList.add('active');
            }
            
            const themeIcon = document.createElement('span');
            themeIcon.className = 'theme-icon';
            themeIcon.textContent = theme.icon;
            
            const themeName = document.createElement('span');
            themeName.className = 'theme-name';
            themeName.textContent = theme.name;
            
            themeOption.appendChild(themeIcon);
            themeOption.appendChild(themeName);
            
            // Add click event
            themeOption.addEventListener('click', () => {
                // Update active class
                container.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                themeOption.classList.add('active');
                
                // Call onSelect callback
                if (typeof onSelect === 'function') {
                    onSelect(themeId);
                }
            });
            
            container.appendChild(themeOption);
        });
    };
    
    // Initialize on page load
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', init);
    }
    
    // Public API
    return {
        getAllThemes,
        getTheme,
        getThemeIds,
        applyMessageTheme,
        playThemeAnimation,
        stopThemeAnimation,
        setAppTheme,
        getAppTheme,
        toggleAppTheme,
        generateThemeSelector,
        init
    };
})(); 