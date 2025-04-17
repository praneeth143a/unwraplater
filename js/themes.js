/**
 * ThemeManager
 * Manages theme handling for time capsules
 */
const ThemeManager = (() => {
    // Theme configurations
    const themes = {
        love: {
            name: 'Love',
            icon: '💖',
            primaryColor: '#ff5e7d',
            secondaryColor: '#ffc0cb',
            animationType: 'hearts',
            fontFamily: "'Dancing Script', cursive, sans-serif",
            backgroundGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
        },
        bestFriends: {
            name: 'Best Friends',
            icon: '🤝',
            primaryColor: '#fbad50',
            secondaryColor: '#ffd966',
            animationType: 'stars',
            fontFamily: "'Comic Neue', sans-serif",
            backgroundGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
        },
        birthday: {
            name: 'Birthday',
            icon: '🎂',
            primaryColor: '#ff8a00',
            secondaryColor: '#ffcc00',
            animationType: 'confetti',
            fontFamily: "'Pacifico', cursive, sans-serif",
            backgroundGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
        },
        celebration: {
            name: 'Celebration',
            icon: '🎉',
            primaryColor: '#7952b3',
            secondaryColor: '#e0caff',
            animationType: 'confetti',
            fontFamily: "'Lobster', cursive, sans-serif",
            backgroundGradient: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)'
        }
    };
    
    /**
     * Get theme configuration
     * @param {string} themeName - Name of the theme
     * @returns {Object} Theme configuration
     */
    const getTheme = (themeName) => {
        return themes[themeName] || themes.love; // Default to love theme
    };
    
    /**
     * Apply theme to container
     * @param {string} themeName - Name of the theme
     * @param {HTMLElement} container - Container to apply theme to
     */
    const applyTheme = (themeName, container) => {
        const theme = getTheme(themeName);
        
        // Apply theme styles
        container.style.fontFamily = theme.fontFamily;
        container.style.background = theme.backgroundGradient;
        container.style.color = theme.primaryColor;
        
        // Add theme class
        container.classList.add(`theme-${themeName}`);
    };
    
    /**
     * Generate theme CSS
     * @returns {string} CSS string
     */
    const generateThemeCSS = () => {
        let css = '';
        
        for (const [key, theme] of Object.entries(themes)) {
            css += `
                .theme-${key} {
                    --primary-color: ${theme.primaryColor};
                    --secondary-color: ${theme.secondaryColor};
                    --background-gradient: ${theme.backgroundGradient};
                    --font-family: ${theme.fontFamily};
                }
                
                .theme-option[data-theme="${key}"] {
                    color: ${theme.primaryColor};
                    border-color: ${theme.primaryColor};
                }
                
                .theme-option[data-theme="${key}"].selected {
                    background-color: ${theme.primaryColor};
                    color: white;
                }
            `;
        }
        
        return css;
    };
    
    /**
     * Initialize themes
     */
    const init = () => {
        // Inject theme CSS
        const style = document.createElement('style');
        style.textContent = generateThemeCSS();
        document.head.appendChild(style);
        
        // Add selected class to default theme
        const defaultTheme = document.querySelector('.theme-option[data-theme="love"]');
        if (defaultTheme) {
            defaultTheme.classList.add('selected');
        }
    };
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);
    
    // Public API
    return {
        getTheme,
        applyTheme,
        themes
    };
})();
