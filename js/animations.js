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
     * Play theme-specific animation
     * @param {string} theme - Theme name
     * @param {HTMLElement} container - Animation container
     */
    const playAnimation = (theme, container) => {
        // Stop any current animation
        stopAnimation();
        
        // Show canvas
        if (!initCanvas()) return;
        animationCanvas.classList.remove('hidden');
        
        // Store current animation
        currentAnimation = theme;
        
        // Start appropriate animation
        switch (theme) {
            case 'love':
                startHeartsAnimation();
                break;
            case 'bestFriends':
                startStarsAnimation();
                break;
            case 'birthday':
                startConfettiAnimation();
                break;
            case 'celebration':
                startConfettiAnimation();
                break;
            default:
                startHeartsAnimation();
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
    const startHeartsAnimation = () => {
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
                color: '#ff5e7d'
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
    const startStarsAnimation = () => {
        // Use AnimationHelpers to create particle system for stars
        const starParticles = AnimationHelpers.createParticleSystem({
            count: 50,
            createParticle: () => ({
                x: Math.random() * animationCanvas.width,
                y: Math.random() * animationCanvas.height,
                size: Math.random() * 20 + 5,
                opacity: Math.random() * 0.5 + 0.3,
                pulse: Math.random() * 0.1 + 0.05,
                color: Math.random() > 0.5 ? '#ffcc00' : '#ffffff',
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
    const startConfettiAnimation = () => {
        // Define colors for different themes
        const colors = currentAnimation === 'birthday' ? 
            ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'] : 
            ['#9b59b6', '#3498db', '#f1c40f', '#e74c3c', '#1abc9c'];
        
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