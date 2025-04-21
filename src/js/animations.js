/**
 * Animation Manager
 * Handles canvas-based animations and effects
 */

class AnimationManager {
    constructor() {
        this.canvas = document.getElementById('animation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.confetti = [];
        this.currentAnimation = null;
        this.isActive = false;
        this.lastTime = 0;
        
        // Resize handler
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    startAnimation(type) {
        // Clear any existing animation
        this.stopAnimation();
        
        // Set new animation type
        this.currentAnimation = type;
        this.isActive = true;
        
        // Initialize particles based on animation type
        this.initializeParticles();
        
        // Start animation loop
        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
    
    stopAnimation() {
        this.isActive = false;
        this.particles = [];
        this.confetti = [];
        this.clearCanvas();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    initializeParticles() {
        this.particles = [];
        this.confetti = [];
        
        switch (this.currentAnimation) {
            case 'hearts':
                this.initializeHearts();
                break;
            case 'friendship':
                this.initializeFriendship();
                break;
            case 'balloons':
                this.initializeBalloons();
                break;
            case 'fireworks':
                this.initializeFireworks();
                break;
            case 'particles':
                this.initializeParticlesEffect();
                break;
            case 'sparkles':
                this.initializeSparkles();
                break;
            case 'confetti':
                this.initializeConfetti();
                break;
        }
    }
    
    animate(timestamp) {
        if (!this.isActive) return;
        
        // Calculate delta time for smooth animation
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.clearCanvas();
        
        // Update and draw particles
        this.updateParticles(deltaTime);
        
        // Request next frame
        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
    
    updateParticles(deltaTime) {
        switch (this.currentAnimation) {
            case 'hearts':
                this.updateHearts(deltaTime);
                break;
            case 'friendship':
                this.updateFriendship(deltaTime);
                break;
            case 'balloons':
                this.updateBalloons(deltaTime);
                break;
            case 'fireworks':
                this.updateFireworks(deltaTime);
                break;
            case 'particles':
                this.updateParticlesEffect(deltaTime);
                break;
            case 'sparkles':
                this.updateSparkles(deltaTime);
                break;
            case 'confetti':
                this.updateConfetti(deltaTime);
                break;
        }
    }
    
    // HEARTS ANIMATION
    initializeHearts() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 100,
                size: 10 + Math.random() * 20,
                speedY: -1 - Math.random() * 2,
                speedX: (Math.random() - 0.5) * 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: `rgba(255, ${50 + Math.random() * 150}, ${100 + Math.random() * 155}, ${0.7 + Math.random() * 0.3})`
            });
        }
    }
    
    updateHearts(deltaTime) {
        // Draw existing hearts
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            
            // Draw heart
            this.drawHeart(p.x, p.y, p.size, p.rotation, p.color);
            
            // Remove if out of screen
            if (p.y < -p.size * 2) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        
        // Add new hearts
        if (this.particles.length < 20 && Math.random() < 0.1) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 100,
                size: 10 + Math.random() * 20,
                speedY: -1 - Math.random() * 2,
                speedX: (Math.random() - 0.5) * 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: `rgba(255, ${50 + Math.random() * 150}, ${100 + Math.random() * 155}, ${0.7 + Math.random() * 0.3})`
            });
        }
    }
    
    drawHeart(x, y, size, rotation, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(size / 30, size / 30);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(-10, -10, -15, 0, 0, 10);
        this.ctx.bezierCurveTo(15, 0, 10, -10, 0, 0);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // FRIENDSHIP ANIMATION
    initializeFriendship() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: `rgba(${50 + Math.random() * 150}, ${100 + Math.random() * 155}, 255, ${0.7 + Math.random() * 0.3})`,
                connections: []
            });
        }
    }
    
    updateFriendship(deltaTime) {
        // Update positions
        for (const p of this.particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            
            // Clear connections
            p.connections = [];
        }
        
        // Find connections
        const connectionDistance = 150;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Store connection with opacity based on distance
                    const opacity = 1 - (distance / connectionDistance);
                    p1.connections.push({ particle: p2, opacity });
                }
            }
        }
        
        // Draw connections first
        for (const p of this.particles) {
            for (const connection of p.connections) {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(connection.particle.x, connection.particle.y);
                this.ctx.strokeStyle = `rgba(79, 70, 229, ${connection.opacity * 0.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
        
        // Draw particles
        for (const p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
    }
    
    // BALLOONS ANIMATION
    initializeBalloons() {
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 50 + Math.random() * 100,
                size: 20 + Math.random() * 30,
                speedY: -0.5 - Math.random() * 1.5,
                wobbleSpeed: (Math.random() - 0.5) * 0.2,
                wobbleAmount: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                stringLength: 30 + Math.random() * 20
            });
        }
    }
    
    updateBalloons(deltaTime) {
        // Draw existing balloons
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.y += p.speedY;
            p.wobbleAmount += p.wobbleSpeed;
            const wobbleX = Math.sin(p.wobbleAmount) * 3;
            
            // Draw balloon
            this.ctx.beginPath();
            this.ctx.arc(p.x + wobbleX, p.y, p.size / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // Draw string
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + wobbleX, p.y + p.size / 2);
            this.ctx.lineTo(p.x, p.y + p.size / 2 + p.stringLength);
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Remove if out of screen
            if (p.y < -p.size * 2) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        
        // Add new balloons
        if (this.particles.length < 15 && Math.random() < 0.05) {
            const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
            
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 50,
                size: 20 + Math.random() * 30,
                speedY: -0.5 - Math.random() * 1.5,
                wobbleSpeed: (Math.random() - 0.5) * 0.2,
                wobbleAmount: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                stringLength: 30 + Math.random() * 20
            });
        }
    }
    
    // FIREWORKS ANIMATION
    initializeFireworks() {
        // Start with a few fireworks
        for (let i = 0; i < 3; i++) {
            this.launchFirework();
        }
    }
    
    launchFirework() {
        const x = Math.random() * this.canvas.width;
        const targetY = 100 + Math.random() * (this.canvas.height * 0.5);
        
        this.particles.push({
            type: 'rocket',
            x: x,
            y: this.canvas.height,
            targetY: targetY,
            speedY: -3 - Math.random() * 2,
            size: 3,
            color: '#ffffff',
            trailCount: 0,
            trail: []
        });
    }
    
    createExplosion(x, y) {
        const particleCount = 50 + Math.floor(Math.random() * 50);
        const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            this.particles.push({
                type: 'spark',
                x: x,
                y: y,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                color: color,
                life: 1, // Full life
                decay: 0.01 + Math.random() * 0.02 // Random decay rate
            });
        }
    }
    
    updateFireworks(deltaTime) {
        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            if (p.type === 'rocket') {
                // Update rocket
                p.y += p.speedY;
                
                // Add trail
                if (p.trailCount % 2 === 0) {
                    p.trail.push({ x: p.x, y: p.y, size: p.size, opacity: 1 });
                }
                p.trailCount++;
                
                // Draw trail
                for (let j = 0; j < p.trail.length; j++) {
                    const t = p.trail[j];
                    t.opacity -= 0.05;
                    
                    if (t.opacity <= 0) {
                        p.trail.splice(j, 1);
                        j--;
                        continue;
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, t.size * t.opacity, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 200, 100, ${t.opacity})`;
                    this.ctx.fill();
                }
                
                // Draw rocket
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                
                // Check if reached target
                if (p.y <= p.targetY) {
                    // Create explosion and remove rocket
                    this.createExplosion(p.x, p.y);
                    this.particles.splice(i, 1);
                    i--;
                }
            } else if (p.type === 'spark') {
                // Update spark
                p.x += p.speedX;
                p.y += p.speedY;
                
                // Apply gravity
                p.speedY += 0.03;
                
                // Update life
                p.life -= p.decay;
                
                // Draw spark
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                const opacity = p.life;
                this.ctx.fillStyle = p.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
                this.ctx.fill();
                
                // Remove if dead
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                    i--;
                }
            }
        }
        
        // Launch new fireworks
        if (Math.random() < 0.03 && this.particles.filter(p => p.type === 'rocket').length < 5) {
            this.launchFirework();
        }
    }
    
    // PARTICLES EFFECT
    initializeParticlesEffect() {
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${0.3 + Math.random() * 0.7})`
            });
        }
    }
    
    updateParticlesEffect(deltaTime) {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around screen edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
    }
    
    // SPARKLES EFFECT
    initializeSparkles() {
        // Start with fewer sparkles, add more over time
        for (let i = 0; i < 30; i++) {
            this.addSparkle();
        }
    }
    
    addSparkle() {
        this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 1 + Math.random() * 2,
            speed: 0.01 + Math.random() * 0.03,
            brightness: 0,
            maxBrightness: 0.7 + Math.random() * 0.3,
            growing: true,
            color: `rgba(255, 255, 255, ` // Alpha will be set in update
        });
    }
    
    updateSparkles(deltaTime) {
        // Draw sparkles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update brightness
            if (p.growing) {
                p.brightness += p.speed;
                if (p.brightness >= p.maxBrightness) {
                    p.growing = false;
                }
            } else {
                p.brightness -= p.speed;
                if (p.brightness <= 0) {
                    // Reset at new position
                    p.x = Math.random() * this.canvas.width;
                    p.y = Math.random() * this.canvas.height;
                    p.growing = true;
                    p.brightness = 0;
                    p.maxBrightness = 0.7 + Math.random() * 0.3;
                    p.speed = 0.01 + Math.random() * 0.03;
                }
            }
            
            // Draw sparkle
            const size = p.size * (1 + p.brightness);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + p.brightness + ')';
            this.ctx.fill();
            
            // Draw sparkle rays
            if (p.brightness > 0.4) {
                const rayLength = size * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x - rayLength, p.y);
                this.ctx.lineTo(p.x + rayLength, p.y);
                this.ctx.moveTo(p.x, p.y - rayLength);
                this.ctx.lineTo(p.x, p.y + rayLength);
                this.ctx.strokeStyle = p.color + (p.brightness * 0.5) + ')';
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
            }
        }
        
        // Add more sparkles occasionally
        if (this.particles.length < 50 && Math.random() < 0.1) {
            this.addSparkle();
        }
    }
    
    // CONFETTI
    initializeConfetti() {
        const colors = ['#ff4d6d', '#4f46e5', '#f59e0b', '#10b981', '#8b5cf6'];
        
        for (let i = 0; i < 100; i++) {
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: -20 - Math.random() * 100,
                size: 5 + Math.random() * 10,
                speedY: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() < 0.5 ? 'rect' : 'circle'
            });
        }
    }
    
    updateConfetti(deltaTime) {
        // Draw existing confetti
        for (let i = 0; i < this.confetti.length; i++) {
            const c = this.confetti[i];
            
            // Update position and rotation
            c.y += c.speedY;
            c.x += c.speedX;
            c.rotation += c.rotationSpeed;
            
            // Add wobble
            c.x += Math.sin(c.y * 0.01) * 0.5;
            
            // Draw confetti
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate(c.rotation);
            this.ctx.fillStyle = c.color;
            
            if (c.shape === 'rect') {
                this.ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
            
            // Remove if out of screen
            if (c.y > this.canvas.height + c.size) {
                this.confetti.splice(i, 1);
                i--;
            }
        }
        
        // Add new confetti
        if (this.confetti.length < 100 && Math.random() < 0.1) {
            const colors = ['#ff4d6d', '#4f46e5', '#f59e0b', '#10b981', '#8b5cf6'];
            
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                size: 5 + Math.random() * 10,
                speedY: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() < 0.5 ? 'rect' : 'circle'
            });
        }
    }
    
    // Create a burst of confetti at a specific position
    burstConfetti(x, y, amount = 50) {
        const colors = ['#ff4d6d', '#4f46e5', '#f59e0b', '#10b981', '#8b5cf6'];
        
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            
            this.confetti.push({
                x: x,
                y: y,
                size: 5 + Math.random() * 10,
                speedY: Math.sin(angle) * speed,
                speedX: Math.cos(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() < 0.5 ? 'rect' : 'circle',
                gravity: 0.1 + Math.random() * 0.1,
                decay: 0.96 + Math.random() * 0.03
            });
        }
        
        // Start the animation if not already active
        if (!this.isActive) {
            this.isActive = true;
            this.currentAnimation = 'confetti-burst';
            requestAnimationFrame((timestamp) => this.animate(timestamp));
        }
    }
}

// Create and export animation manager
const animationManager = new AnimationManager();
window.animationManager = animationManager; 