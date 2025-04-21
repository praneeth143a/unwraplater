/**
 * Themes Manager
 * Handles theme selection, preview, and application
 */

class ThemesManager {
    constructor() {
        this.themes = {
            love: {
                name: "Love",
                icon: "💖",
                colors: {
                    primary: "#ff4d6d",
                    secondary: "#ff8fa3",
                    background: "linear-gradient(135deg, #ff8fa3, #ff4d6d)"
                },
                font: "'Poppins', sans-serif",
                animation: "hearts",
                useConfetti: true
            },
            friendship: {
                name: "Best Friends",
                icon: "🤝",
                colors: {
                    primary: "#4f46e5",
                    secondary: "#818cf8", 
                    background: "linear-gradient(135deg, #818cf8, #4f46e5)"
                },
                font: "'Poppins', sans-serif",
                animation: "friendship",
                useConfetti: false
            },
            birthday: {
                name: "Birthday",
                icon: "🎂",
                colors: {
                    primary: "#f59e0b",
                    secondary: "#fbbf24",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)"
                },
                font: "'Poppins', sans-serif",
                animation: "balloons",
                useConfetti: true
            },
            celebration: {
                name: "Celebration",
                icon: "🎉",
                colors: {
                    primary: "#10b981",
                    secondary: "#34d399",
                    background: "linear-gradient(135deg, #34d399, #10b981)"
                },
                font: "'Poppins', sans-serif",
                animation: "fireworks",
                useConfetti: true
            },
            custom: {
                name: "Custom Theme",
                icon: "✨",
                colors: {
                    primary: "#6b46c1",
                    secondary: "#9f7aea",
                    background: "#ffffff"
                },
                font: "'Poppins', sans-serif",
                animation: "none",
                useConfetti: false
            }
        };
        
        this.currentTheme = "love"; // Default theme
        this.init();
    }
    
    init() {
        // Set up theme selector
        const themeSelect = document.getElementById('theme-select');
        const customOptions = document.getElementById('custom-theme-options');
        const themePreview = document.getElementById('theme-preview');
        const previewContainer = themePreview.querySelector('.preview-container');
        
        // Theme select change handler
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            this.currentTheme = selectedTheme;
            
            // Show/hide custom options
            if (selectedTheme === 'custom') {
                customOptions.classList.remove('hidden');
                this.setupCustomThemeListeners();
            } else {
                customOptions.classList.add('hidden');
            }
            
            // Update preview
            this.updateThemePreview();
        });
        
        // Initialize preview
        this.updateThemePreview();
    }
    
    setupCustomThemeListeners() {
        const bgColorInput = document.getElementById('custom-bg-color');
        const fontSelect = document.getElementById('custom-font');
        const animationSelect = document.getElementById('custom-animation');
        
        // Update custom theme when options change
        const updateCustomTheme = () => {
            this.themes.custom.colors.background = bgColorInput.value;
            this.themes.custom.font = this.getFontFamily(fontSelect.value);
            this.themes.custom.animation = animationSelect.value;
            this.themes.custom.useConfetti = animationSelect.value === 'confetti';
            
            // Update preview
            this.updateThemePreview();
        };
        
        // Add listeners
        bgColorInput.addEventListener('input', updateCustomTheme);
        fontSelect.addEventListener('change', updateCustomTheme);
        animationSelect.addEventListener('change', updateCustomTheme);
    }
    
    getFontFamily(fontValue) {
        const fonts = {
            'poppins': "'Poppins', sans-serif",
            'roboto': "'Roboto', sans-serif",
            'playfair': "'Playfair Display', serif",
            'montserrat': "'Montserrat', sans-serif"
        };
        
        return fonts[fontValue] || fonts.poppins;
    }
    
    updateThemePreview() {
        const previewContainer = document.querySelector('.preview-container');
        const theme = this.themes[this.currentTheme];
        
        // Apply theme to preview
        previewContainer.style.background = theme.colors.background;
        previewContainer.style.fontFamily = theme.font;
        previewContainer.style.color = this.getContrastColor(theme.colors.primary);
        
        // Add theme class for CSS
        previewContainer.className = 'preview-container';
        previewContainer.classList.add(`theme-${this.currentTheme}`);
        
        // Update preview content
        const previewContent = previewContainer.querySelector('.preview-content');
        previewContent.innerHTML = `
            <p style="text-align: center; font-size: 1.2rem;">
                ${theme.icon} Your message will look like this ${theme.icon}
            </p>
            <p style="text-align: center; margin-top: 10px;">
                Theme: ${theme.name}
            </p>
        `;
    }
    
    // Helper function to determine text color based on background
    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate brightness (YIQ equation)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Return black or white based on brightness
        return brightness > 128 ? '#000000' : '#ffffff';
    }
    
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }
    
    // Apply theme to message display
    applyThemeToMessage(messageContainer) {
        const theme = this.themes[this.currentTheme];
        
        messageContainer.style.background = theme.colors.background;
        messageContainer.style.fontFamily = theme.font;
        messageContainer.style.color = this.getContrastColor(theme.colors.primary);
        
        // Add theme class
        messageContainer.className = 'message-container';
        messageContainer.classList.add(`theme-${this.currentTheme}`);
    }
    
    // Get theme data for saving in capsule
    getThemeData() {
        return {
            themeId: this.currentTheme,
            customSettings: this.currentTheme === 'custom' ? {
                backgroundColor: document.getElementById('custom-bg-color').value,
                font: document.getElementById('custom-font').value,
                animation: document.getElementById('custom-animation').value
            } : null
        };
    }
    
    // Load theme from saved data
    loadThemeFromData(themeData) {
        if (!themeData) return;
        
        this.currentTheme = themeData.themeId || 'love';
        
        // If custom theme, load custom settings
        if (this.currentTheme === 'custom' && themeData.customSettings) {
            const { backgroundColor, font, animation } = themeData.customSettings;
            
            // Update custom theme with saved settings
            this.themes.custom.colors.background = backgroundColor;
            this.themes.custom.font = this.getFontFamily(font);
            this.themes.custom.animation = animation;
            this.themes.custom.useConfetti = animation === 'confetti';
            
            // Update UI elements if present
            const bgColorInput = document.getElementById('custom-bg-color');
            const fontSelect = document.getElementById('custom-font');
            const animationSelect = document.getElementById('custom-animation');
            
            if (bgColorInput) bgColorInput.value = backgroundColor;
            if (fontSelect) fontSelect.value = font;
            if (animationSelect) animationSelect.value = animation;
        }
    }
}

// Export themes manager
const themesManager = new ThemesManager();
window.themesManager = themesManager; // Make accessible globally 