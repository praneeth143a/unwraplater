/**
 * AnimationManager
 * Handles animations for theme reveals
 */
const AnimationManager = (() => {
    // Animation state
    let currentAnimation = null;
    let animationCanvas = null;
    let ctx = null;
    let animationFrameId = null;
    let soundEnabled = false;
    let audioContext = null;
    let audioElements = {};
    
    /**
     * Initialize the animation canvas
     */
    const initCanvas = () => {
        animationCanvas = document.getElementById('animation-canvas');
        if (!animationCanvas) return false;
        
        ctx = animationCanvas.getContext('2d');
        
        // Set canvas to full window size
        animationCanvas.width = window.innerWidth;
        animationCanvas.height = window.innerHeight;
        
        // Handle resize
        window.addEventListener('resize', () => {
            animationCanvas.width = window.innerWidth;
            animationCanvas.height = window.innerHeight;
        });
        
        return true;
    };
    
    /**
     * Initialize audio context
     */
    const initAudio = () => {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create audio elements for different themes
            audioElements = {
                love: createAudio('love'),
                bestFriends: createAudio('bestFriends'),
                birthday: createAudio('birthday'),
                motivational: createAudio('motivational'),
                celebration: createAudio('celebration')
            };
            
            return true;
        } catch (e) {
            console.error('Web Audio API not supported:', e);
            return false;
        }
    };
    
    /**
     * Create an audio element for a theme
     * @param {string} theme - Theme name
     * @returns {HTMLAudioElement} Audio element
     */
    const createAudio = (theme) => {
        const audio = document.createElement('audio');
        audio.preload = 'auto';
        audio.loop = true;
        
        // Use different sounds based on theme
        switch(theme) {
            case 'love':
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAwCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra0AAAASUxBTUUzLjEwMACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUxBIDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
                break;
            case 'bestFriends':
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAwCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra0AAAASUxBTUUzLjEwMACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUxBIDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
                break;
            case 'birthday':
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAwCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra0AAAASUxBTUUzLjEwMACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUxBIDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
                break;
            case 'motivational':
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAwCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra0AAAASUxBTUUzLjEwMACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUxBIDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
                break;
            case 'celebration':
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAwCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra0AAAASUxBTUUzLjEwMACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUxBIDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
                break;
        }
        
        return audio;
    };
    
    /**
     * Play an animation based on theme
     * @param {string} theme - Theme name
     * @param {HTMLElement} container - Container to append animation to
     * @param {boolean} [withSound=false] - Whether to play sound with animation
     * @param {string} [customColor=null] - Custom color for the animation (hex)
     */
    const playAnimation = (theme, container, withSound = false, customColor = null) => {
        // Clear any existing animation
        stopAnimation();
        
        // Get a reference to the canvas
        const canvas = document.getElementById('animation-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Show the canvas
        canvas.classList.remove('hidden');
        
        // Set animation based on theme
        let animationFunction;
        let particles = [];
        
        // Color theme settings
        let colors;
        
        // If custom color is provided, use it
        if (customColor) {
            // Generate a color scheme based on the custom color
            const baseColor = customColor;
            const lighterColor = adjustColor(baseColor, 20);
            const darkerColor = adjustColor(baseColor, -20);
            const accentColor = getComplementaryColor(baseColor);
            
            colors = [baseColor, lighterColor, darkerColor, accentColor];
        } else {
            // Default color themes
            const colorThemes = {
                love: ['#e74c3c', '#c0392b', '#ff7979', '#f8c9d4'],
                bestFriends: ['#3498db', '#2980b9', '#74b9ff', '#a1c4fd'],
                birthday: ['#f1c40f', '#f39c12', '#fdcb6e', '#ffeaa7'],
                celebration: ['#9b59b6', '#8e44ad', '#a29bfe', '#c39bd3'],
                bubbles: ['#00bcd4', '#0097a7', '#4dd0e1', '#b2ebf2'],
                sparkles: ['#ffd700', '#ff9800', '#ffeb3b', '#ffe082'],
                fireworks: ['#ff4081', '#f50057', '#ff80ab', '#f8bbd0'],
                confetti: ['#4caf50', '#43a047', '#66bb6a', '#a5d6a7']
            };
            
            // Use the appropriate color theme or default to celebration
            colors = colorThemes[theme] || colorThemes.celebration;
        }
        
        // Set animation function based on theme
        switch(theme) {
            case 'love':
            case 'hearts':
                animationFunction = () => startHeartsAnimation(ctx, colors);
                break;
            case 'bestFriends':
            case 'stars':
                animationFunction = () => startStarsAnimation(ctx, colors);
                break;
            case 'birthday':
            case 'confetti':
                animationFunction = () => startConfettiAnimation(ctx, colors);
                break;
            case 'celebration':
                animationFunction = () => startFireworksAnimation(ctx, colors);
                break;
            case 'bubbles':
                animationFunction = () => startBubblesAnimation(ctx, colors);
                break;
            case 'sparkles':
                animationFunction = () => startSparklesAnimation(ctx, colors);
                break;
            case 'fireworks':
                animationFunction = () => startFireworksAnimation(ctx, colors);
                break;
            default:
                // Default to confetti
                animationFunction = () => startConfettiAnimation(ctx, colors);
        }
        
        // Apply theme class to container if provided
        if (container) {
            container.setAttribute('data-capsule-theme', theme);
            
            // If custom color, apply it to the container
            if (customColor) {
                container.style.setProperty('--theme-primary', customColor);
                container.style.setProperty('--theme-secondary', adjustColor(customColor, -20));
                container.style.setProperty('--theme-accent', adjustColor(customColor, 20));
                container.style.setProperty('--theme-bg', adjustColor(customColor, 90));
                container.style.setProperty('--theme-gradient', 
                    `linear-gradient(135deg, ${customColor} 0%, ${adjustColor(customColor, 20)} 100%)`);
            }
        }
        
        // Start the animation
        currentAnimation = requestAnimationFrame(animationFunction);
        
        // Play sound if enabled
        if (withSound && typeof SoundManager !== 'undefined') {
            SoundManager.playThemeSound(theme);
        }
    };
    
    /**
     * Stop current animation
     */
    const stopAnimation = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Stop all audio
        for (const key in audioElements) {
            if (audioElements[key]) {
                audioElements[key].pause();
                audioElements[key].currentTime = 0;
            }
        }
        
        // Clear canvas
        if (ctx && animationCanvas) {
            ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
        }
        
        // Hide canvas when stopped
        if (animationCanvas) {
            animationCanvas.classList.add('hidden');
        }
        
        currentAnimation = null;
    };
    
    /**
     * Start hearts animation for Love theme
     */
    const startHeartsAnimation = (ctx, colors) => {
        // Use AnimationHelpers to create particle system for hearts
        const heartParticles = AnimationHelpers.createParticleSystem({
            count: 30,
            createParticle: () => ({
                x: Math.random() * animationCanvas.width,
                y: animationCanvas.height + Math.random() * 100,
                size: Math.random() * 40 + 20,
                speed: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.5,
                rotate: Math.random() * 360,
                color: colors[Math.floor(Math.random() * colors.length)]
            }),
            updateParticle: (particle) => {
                particle.y -= particle.speed;
                particle.rotate += 0.2;
            },
            renderParticle: (ctx, particle) => {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotate * Math.PI / 180);
                ctx.globalAlpha = particle.opacity;
                
                // Draw heart
                ctx.fillStyle = particle.color;
                const size = particle.size;
                ctx.beginPath();
                ctx.moveTo(0, size / 4);
                ctx.bezierCurveTo(size / 4, -size / 10, size / 2, -size / 4, 0, -size / 2);
                ctx.bezierCurveTo(-size / 2, -size / 4, -size / 4, -size / 10, 0, size / 4);
                ctx.fill();
                
                ctx.restore();
            },
            shouldReset: (particle, canvas) => {
                return particle.y < -particle.size;
            },
            resetParticle: (particle, canvas) => {
                particle.x = Math.random() * canvas.width;
                particle.y = canvas.height + particle.size;
                particle.rotate = Math.random() * 360;
            }
        });
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            
            // Update and render particles
            heartParticles.update(ctx, animationCanvas);
            
            // Continue animation loop
            animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    };
    
    /**
     * Start stars animation for Best Friends theme
     */
    const startStarsAnimation = (ctx, colors) => {
        // Use AnimationHelpers to create particle system for stars
        const starParticles = AnimationHelpers.createParticleSystem({
            count: 50,
            createParticle: () => ({
                x: Math.random() * animationCanvas.width,
                y: Math.random() * animationCanvas.height,
                size: Math.random() * 20 + 5,
                opacity: Math.random() * 0.5 + 0.3,
                pulse: Math.random() * 0.1 + 0.05,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulseTiming: Math.random() * Math.PI * 2
            }),
            updateParticle: (particle, index, particles) => {
                particle.pulseTiming += particle.pulse;
                particle.opacity = 0.3 + Math.sin(particle.pulseTiming) * 0.3;
            },
            renderParticle: (ctx, particle) => {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.globalAlpha = particle.opacity;
                
                // Draw star
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const innerAngle = angle + Math.PI / 5;
                    
                    const outerX = Math.cos(angle) * particle.size;
                    const outerY = Math.sin(angle) * particle.size;
                    
                    const innerX = Math.cos(innerAngle) * (particle.size / 2.5);
                    const innerY = Math.sin(innerAngle) * (particle.size / 2.5);
                    
                    if (i === 0) {
                        ctx.moveTo(outerX, outerY);
                    } else {
                        ctx.lineTo(outerX, outerY);
                    }
                    
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            },
            shouldReset: (particle, canvas) => {
                return false; // Stars don't reset, they pulse in place
            },
            resetParticle: (particle, canvas) => {
                // Not used for stars animation
            }
        });
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            
            // Update and render particles
            starParticles.update(ctx, animationCanvas);
            
            // Continue animation loop
            animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    };
    
    /**
     * Start confetti animation for Birthday/Celebration theme
     */
    const startConfettiAnimation = (ctx, colors) => {
        // Use AnimationHelpers to create particle system for confetti
        const confettiParticles = AnimationHelpers.createParticleSystem({
            count: 100,
            createParticle: () => ({
                x: Math.random() * animationCanvas.width,
                y: -30,
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 5,
                speedX: (Math.random() - 0.5) * 2,
                speedY: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.5,
                shape: Math.floor(Math.random() * 3) // 0: square, 1: circle, 2: triangle
            }),
            updateParticle: (particle) => {
                particle.y += particle.speedY;
                particle.x += particle.speedX;
                particle.rotation += particle.rotationSpeed;
                
                // Add gravity effect
                particle.speedY += 0.03;
                
                // Add wind effect
                particle.speedX += (Math.random() - 0.5) * 0.05;
            },
            renderParticle: (ctx, particle) => {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation * Math.PI / 180);
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                
                // Draw different shapes based on particle.shape
                switch(particle.shape) {
                    case 0: // Square
                        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                        break;
                    case 1: // Circle
                        ctx.beginPath();
                        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 2: // Triangle
                        ctx.beginPath();
                        ctx.moveTo(0, -particle.size / 2);
                        ctx.lineTo(particle.size / 2, particle.size / 2);
                        ctx.lineTo(-particle.size / 2, particle.size / 2);
                        ctx.closePath();
                        ctx.fill();
                        break;
                }
                
                ctx.restore();
            },
            shouldReset: (particle, canvas) => {
                return particle.y > canvas.height + particle.size;
            },
            resetParticle: (particle, canvas) => {
                particle.x = Math.random() * canvas.width;
                particle.y = -particle.size;
                particle.speedY = Math.random() * 5 + 3;
                particle.speedX = (Math.random() - 0.5) * 2;
            }
        });
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            
            // Update and render particles
            confettiParticles.update(ctx, animationCanvas);
            
            // Continue animation loop
            animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    };
    
    /**
     * Start sunrise animation for Motivational theme
     */
    const startSunriseAnimation = () => {
        // Create color transition for the sky
        const skyColors = AnimationHelpers.createColorTransition(
            ['#2c3e50', '#3498db', '#87ceeb'], 
            100
        );
        
        // Sun properties
        const sun = {
            x: animationCanvas.width / 2,
            y: animationCanvas.height + 50,
            radius: Math.min(animationCanvas.width, animationCanvas.height) * 0.2,
            targetY: animationCanvas.height * 0.6,
            rays: [],
            particles: []
        };
        
        // Create rays
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            sun.rays.push({
                angle,
                length: sun.radius * 0.5,
                maxLength: sun.radius * 0.8,
                speed: 0.01 + Math.random() * 0.02
            });
        }
        
        // Create particle system for light particles
        const lightParticles = AnimationHelpers.createParticleSystem({
            count: 50,
            createParticle: () => {
                const angle = Math.random() * Math.PI * 2;
                const distance = sun.radius * (0.8 + Math.random() * 0.5);
                return {
                    x: sun.x + Math.cos(angle) * distance,
                    y: sun.y + Math.sin(angle) * distance,
                    size: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 0.8,
                    speedY: -Math.random() * 1.5 - 0.5,
                    opacity: Math.random() * 0.7 + 0.3,
                    color: '#fff'
                };
            },
            updateParticle: (particle) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.opacity -= 0.005;
            },
            renderParticle: (ctx, particle) => {
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            shouldReset: (particle) => {
                return particle.opacity <= 0;
            },
            resetParticle: (particle) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = sun.radius * (0.8 + Math.random() * 0.5);
                particle.x = sun.x + Math.cos(angle) * distance;
                particle.y = sun.y + Math.sin(angle) * distance;
                particle.size = Math.random() * 4 + 2;
                particle.speedX = (Math.random() - 0.5) * 0.8;
                particle.speedY = -Math.random() * 1.5 - 0.5;
                particle.opacity = Math.random() * 0.7 + 0.3;
            }
        });
        
        // Create easing function for sun rise
        const easeOutCubic = AnimationHelpers.createEasing('easeOutCubic');
        let progress = 0;
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            
            // Update progress
            if (progress < 1) {
                progress += 0.005;
            }
            
            // Calculate sun position with easing
            const easedProgress = easeOutCubic(progress);
            sun.y = animationCanvas.height + 50 - easedProgress * ((animationCanvas.height + 50) - sun.targetY);
            
            // Draw sky gradient
            const skyColorIndex = Math.min(Math.floor(easedProgress * skyColors.length), skyColors.length - 1);
            const skyGradient = ctx.createLinearGradient(0, 0, 0, animationCanvas.height);
            skyGradient.addColorStop(0, skyColors[skyColorIndex]);
            skyGradient.addColorStop(1, '#fff');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, animationCanvas.width, animationCanvas.height);
            
            // Draw sun glow
            const gradient = ctx.createRadialGradient(
                sun.x, sun.y, sun.radius * 0.7,
                sun.x, sun.y, sun.radius * 2
            );
            gradient.addColorStop(0, 'rgba(255, 204, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw sun
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw rays
            ctx.fillStyle = '#ffcc00';
            sun.rays.forEach((ray, i) => {
                ray.length = sun.radius * 0.5 + Math.sin(Date.now() * ray.speed) * (sun.radius * 0.3);
                
                const startX = sun.x + Math.cos(ray.angle) * sun.radius;
                const startY = sun.y + Math.sin(ray.angle) * sun.radius;
                const endX = sun.x + Math.cos(ray.angle) * (sun.radius + ray.length);
                const endY = sun.y + Math.sin(ray.angle) * (sun.radius + ray.length);
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#ffcc00';
                ctx.stroke();
            });
            
            // Update and render light particles
            lightParticles.update(ctx, animationCanvas);
            
            // Continue animation loop
            animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    };
    
    // Public API
    return {
        playAnimation,
        stopAnimation
    };
})();

/**
 * Get complementary color for a given hex color
 * @param {string} hex - Hex color code
 * @returns {string} - Complementary color in hex
 */
function getComplementaryColor(hex) {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Get complementary values by inverting
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Adjust a hex color by a percentage
 * @param {string} color - Hex color code
 * @param {number} percent - Percentage to lighten (positive) or darken (negative)
 * @returns {string} - Adjusted color in hex
 */
function adjustColor(color, percent) {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Adjust color by percentage
    r = Math.min(255, Math.max(0, Math.round(r * (100 + percent) / 100)));
    g = Math.min(255, Math.max(0, Math.round(g * (100 + percent) / 100)));
    b = Math.min(255, Math.max(0, Math.round(b * (100 + percent) / 100)));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Create bubbles animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} colors - Array of colors to use
 */
const startBubblesAnimation = (ctx, colors) => {
    // Create bubbles
    const bubbles = [];
    const bubblesCount = 40;
    
    for (let i = 0; i < bubblesCount; i++) {
        bubbles.push({
            x: Math.random() * ctx.canvas.width,
            y: ctx.canvas.height + Math.random() * 100,
            radius: Math.random() * 40 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Update and draw bubbles
        for (let i = 0; i < bubbles.length; i++) {
            const bubble = bubbles[i];
            
            // Update position
            bubble.y -= bubble.speed;
            bubble.x += Math.sin(Date.now() / 1000 + i) * 0.5;
            
            // Draw bubble
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color + Math.floor(bubble.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
            
            // Add highlight
            ctx.beginPath();
            ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            
            // Reset bubble if it's off screen
            if (bubble.y < -bubble.radius * 2) {
                bubble.y = ctx.canvas.height + bubble.radius;
                bubble.x = Math.random() * ctx.canvas.width;
            }
        }
        
        currentAnimation = requestAnimationFrame(animate);
    }
    
    animate();
};

/**
 * Create sparkles animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} colors - Array of colors to use
 */
const startSparklesAnimation = (ctx, colors) => {
    // Create sparkles
    const sparkles = [];
    const sparklesCount = 80;
    
    for (let i = 0; i < sparklesCount; i++) {
        sparkles.push({
            x: Math.random() * ctx.canvas.width,
            y: Math.random() * ctx.canvas.height,
            size: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            opacity: Math.random() * 0.5 + 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.1 - 0.05,
            pulseSpeed: Math.random() * 0.05 + 0.02
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Update and draw sparkles
        for (let i = 0; i < sparkles.length; i++) {
            const sparkle = sparkles[i];
            
            // Update position
            sparkle.x += sparkle.speedX;
            sparkle.y += sparkle.speedY;
            sparkle.rotation += sparkle.rotationSpeed;
            
            // Pulse size
            sparkle.size = sparkle.size * 0.99 + Math.sin(Date.now() * sparkle.pulseSpeed) * 1.5 + 3;
            
            // Draw sparkle
            ctx.save();
            ctx.translate(sparkle.x, sparkle.y);
            ctx.rotate(sparkle.rotation);
            
            ctx.fillStyle = sparkle.color + Math.floor(sparkle.opacity * 255).toString(16).padStart(2, '0');
            
            // Draw a star shape
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = j * Math.PI * 2 / 5;
                const outerX = Math.cos(angle) * sparkle.size;
                const outerY = Math.sin(angle) * sparkle.size;
                const innerX = Math.cos(angle + Math.PI / 5) * (sparkle.size / 2);
                const innerY = Math.sin(angle + Math.PI / 5) * (sparkle.size / 2);
                
                if (j === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
            
            // Reset sparkle if it's off screen
            if (sparkle.x < -sparkle.size || sparkle.x > ctx.canvas.width + sparkle.size ||
                sparkle.y < -sparkle.size || sparkle.y > ctx.canvas.height + sparkle.size) {
                sparkle.x = Math.random() * ctx.canvas.width;
                sparkle.y = Math.random() * ctx.canvas.height;
                sparkle.speedX = Math.random() * 2 - 1;
                sparkle.speedY = Math.random() * 2 - 1;
            }
        }
        
        currentAnimation = requestAnimationFrame(animate);
    }
    
    animate();
};

/**
 * Create fireworks animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} colors - Array of colors to use
 */
const startFireworksAnimation = (ctx, colors) => {
    // Create fireworks and particles
    const fireworks = [];
    const particles = [];
    
    // Add a new firework occasionally
    function addFirework() {
        if (Math.random() < 0.05) {
            fireworks.push({
                x: Math.random() * ctx.canvas.width,
                y: ctx.canvas.height,
                targetY: Math.random() * (ctx.canvas.height * 0.5),
                speed: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 2 + 1
            });
        }
    }
    
    // Create explosion particles
    function createExplosion(x, y, color) {
        const particleCount = Math.floor(Math.random() * 30) + 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: Math.random() * 3 + 1,
                life: Math.random() * 60 + 30,
                gravity: 0.1
            });
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add new firework
        addFirework();
        
        // Update and draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const firework = fireworks[i];
            
            // Move firework upward
            firework.y -= firework.speed;
            
            // Draw firework
            ctx.beginPath();
            ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
            ctx.fillStyle = firework.color;
            ctx.fill();
            
            // Check if firework reached target height
            if (firework.y <= firework.targetY) {
                // Create explosion
                createExplosion(firework.x, firework.y, firework.color);
                // Remove firework
                fireworks.splice(i, 1);
            }
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Apply physics
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.life--;
            
            // Fade out
            const opacity = particle.life / 80;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
            
            // Remove dead particles
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        currentAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}; 