/**
 * Animation Helpers
 * Utility functions to support and enhance animations in the UnwrapLater app
 */

const AnimationHelpers = (function() {
    /**
     * Create a particle system for reusable effects
     * @param {Object} options - Configuration options
     * @param {number} options.count - Number of particles
     * @param {Function} options.createParticle - Function to create a particle
     * @param {Function} options.updateParticle - Function to update a particle
     * @param {Function} options.renderParticle - Function to render a particle
     * @param {Function} options.shouldReset - Function to determine if a particle should reset
     * @param {Function} options.resetParticle - Function to reset a particle
     * @returns {Object} - Particle system API
     */
    const createParticleSystem = (options) => {
        const particles = [];
        
        // Initialize particles
        for (let i = 0; i < options.count; i++) {
            particles.push(options.createParticle(i));
        }
        
        // Update and render particles
        const update = (ctx, canvas) => {
            particles.forEach((particle, index) => {
                // Update particle
                options.updateParticle(particle, index, particles);
                
                // Render particle
                options.renderParticle(ctx, particle);
                
                // Check if particle should be reset
                if (options.shouldReset(particle, canvas)) {
                    options.resetParticle(particle, canvas);
                }
            });
        };
        
        return {
            particles,
            update
        };
    };

    /**
     * Create an easing function
     * @param {string} type - Type of easing ('linear', 'easeInQuad', 'easeOutQuad', etc.)
     * @returns {Function} - Easing function that takes a value between 0 and 1
     */
    const createEasing = (type) => {
        const easings = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
            easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
            bounce: t => {
                if (t < (1/2.75)) {
                    return 7.5625 * t * t;
                } else if (t < (2/2.75)) {
                    return 7.5625 * (t -= (1.5/2.75)) * t + 0.75;
                } else if (t < (2.5/2.75)) {
                    return 7.5625 * (t -= (2.25/2.75)) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= (2.625/2.75)) * t + 0.984375;
                }
            }
        };
        
        return easings[type] || easings.linear;
    };

    /**
     * Create a color transition between multiple colors
     * @param {Array} colors - Array of colors (hex or rgba)
     * @param {number} steps - Number of steps for the transition
     * @returns {Array} - Array of color values for the transition
     */
    const createColorTransition = (colors, steps) => {
        const result = [];
        
        // Helper to convert hex to RGB
        const hexToRgb = (hex) => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        // Helper to parse rgba string
        const parseRgba = (rgba) => {
            const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.?\d*))?\)/);
            return match ? {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
            } : null;
        };
        
        // Convert all colors to RGB objects
        const rgbColors = colors.map(color => {
            if (color.startsWith('#')) {
                return { ...hexToRgb(color), a: 1 };
            } else if (color.startsWith('rgb')) {
                return parseRgba(color);
            }
            return null;
        }).filter(Boolean);
        
        if (rgbColors.length < 2) return result;
        
        // Calculate step size between each color pair
        const segmentSize = steps / (rgbColors.length - 1);
        
        // Generate the transition
        for (let i = 0; i < steps; i++) {
            const segment = Math.min(Math.floor(i / segmentSize), rgbColors.length - 2);
            const progress = (i - segment * segmentSize) / segmentSize;
            
            const start = rgbColors[segment];
            const end = rgbColors[segment + 1];
            
            const r = Math.round(start.r + (end.r - start.r) * progress);
            const g = Math.round(start.g + (end.g - start.g) * progress);
            const b = Math.round(start.b + (end.b - start.b) * progress);
            const a = start.a + (end.a - start.a) * progress;
            
            result.push(`rgba(${r}, ${g}, ${b}, ${a})`);
        }
        
        return result;
    };

    /**
     * Create an animation timeline for sequencing animations
     * @param {Array} keyframes - Array of keyframe objects with time and callback
     * @returns {Object} - Timeline controller
     */
    const createTimeline = (keyframes) => {
        let isPlaying = false;
        let startTime = 0;
        let animationFrameId = null;
        
        // Sort keyframes by time
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
        
        const start = () => {
            if (isPlaying) return;
            
            isPlaying = true;
            startTime = performance.now();
            
            const animate = (currentTime) => {
                if (!isPlaying) return;
                
                const elapsedTime = currentTime - startTime;
                
                // Execute keyframes that should run at this time
                sortedKeyframes.forEach(keyframe => {
                    if (elapsedTime >= keyframe.time && !keyframe.executed) {
                        keyframe.callback(elapsedTime);
                        keyframe.executed = true;
                    }
                });
                
                // Check if all keyframes have executed
                const allExecuted = sortedKeyframes.every(keyframe => keyframe.executed);
                
                if (allExecuted) {
                    stop();
                } else {
                    animationFrameId = requestAnimationFrame(animate);
                }
            };
            
            animationFrameId = requestAnimationFrame(animate);
        };
        
        const stop = () => {
            isPlaying = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Reset executed flags
            sortedKeyframes.forEach(keyframe => {
                keyframe.executed = false;
            });
        };
        
        const reset = () => {
            stop();
            startTime = performance.now();
        };
        
        return {
            start,
            stop,
            reset
        };
    };

    /**
     * Create a sprite sheet animation
     * @param {HTMLImageElement} image - The sprite sheet image
     * @param {Object} options - Configuration options
     * @param {number} options.frameWidth - Width of each frame
     * @param {number} options.frameHeight - Height of each frame
     * @param {number} options.framesPerRow - Number of frames per row in the sprite sheet
     * @param {number} options.totalFrames - Total number of frames
     * @param {number} options.frameRate - Frame rate in frames per second
     * @returns {Object} - Sprite animation controller
     */
    const createSpriteAnimation = (image, options) => {
        const { frameWidth, frameHeight, framesPerRow, totalFrames, frameRate } = options;
        
        let currentFrame = 0;
        let lastFrameTime = 0;
        const frameDuration = 1000 / frameRate;
        
        const update = (time) => {
            if (time - lastFrameTime >= frameDuration) {
                currentFrame = (currentFrame + 1) % totalFrames;
                lastFrameTime = time;
            }
        };
        
        const render = (ctx, x, y, width, height) => {
            const row = Math.floor(currentFrame / framesPerRow);
            const col = currentFrame % framesPerRow;
            
            ctx.drawImage(
                image,
                col * frameWidth,
                row * frameHeight,
                frameWidth,
                frameHeight,
                x,
                y,
                width || frameWidth,
                height || frameHeight
            );
        };
        
        return {
            update,
            render,
            reset: () => { currentFrame = 0; lastFrameTime = 0; }
        };
    };

    // Public API
    return {
        createParticleSystem,
        createEasing,
        createColorTransition,
        createTimeline,
        createSpriteAnimation
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationHelpers;
} 