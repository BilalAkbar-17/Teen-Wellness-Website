class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particlesArray = [];
        this.numberOfParticles = 100;
        this.mousePosition = {
            x: null,
            y: null,
            radius: 150
        };

        this.initialize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseout', () => this.handleMouseOut());
    }

    initialize() {
        const container = document.createElement('div');
        container.className = 'interactive-bg';
        document.body.appendChild(container);
        container.appendChild(this.canvas);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const styles = getComputedStyle(document.documentElement);
        this.primaryColor = styles.getPropertyValue('--primary-color').trim();
        this.secondaryColor = styles.getPropertyValue('--secondary-color').trim();
        this.accentColor = styles.getPropertyValue('--accent-color').trim();

        this.isDarkMode = document.body.classList.contains('dark-mode');
    }

    createParticles() {
        this.particlesArray = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            const size = Math.random() * 5 + 1;
            const x = Math.random() * (this.canvas.width - size * 2);
            const y = Math.random() * (this.canvas.height - size * 2);
            const directionX = Math.random() * 2 - 1;
            const directionY = Math.random() * 2 - 1;
            const color = this.getRandomColor();

            this.particlesArray.push(new Particle(
                x, y, directionX, directionY, size, color, this
            ));
        }
    }

    getRandomColor() {

        const colors = [
            this.isDarkMode ? 
                `rgba(143, 148, 251, 0.1)` : 
                `rgba(78, 84, 200, 0.1)`,
            this.isDarkMode ? 
                `rgba(79, 178, 172, 0.1)` : 
                `rgba(56, 178, 172, 0.1)`,
            this.isDarkMode ? 
                `rgba(251, 211, 141, 0.1)` : 
                `rgba(246, 173, 85, 0.1)`
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
    }

    handleMouseOut() {
        this.mousePosition.x = null;
        this.mousePosition.y = null;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particlesArray.length; i++) {
            this.particlesArray[i].update();
            this.particlesArray[i].draw();
        }

        this.connect();
        requestAnimationFrame(() => this.animate());
    }

    connect() {
        for (let a = 0; a < this.particlesArray.length; a++) {
            for (let b = a; b < this.particlesArray.length; b++) {
                const dx = this.particlesArray[a].x - this.particlesArray[b].x;
                const dy = this.particlesArray[a].y - this.particlesArray[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.isDarkMode ? 
                        `rgba(143, 148, 251, ${0.1 - distance/1200})` : 
                        `rgba(78, 84, 200, ${0.1 - distance/1200})`;
                    this.ctx.lineWidth = 0.3;
                    this.ctx.moveTo(this.particlesArray[a].x, this.particlesArray[a].y);
                    this.ctx.lineTo(this.particlesArray[b].x, this.particlesArray[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(x, y, directionX, directionY, size, color, parent) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.parent = parent;
        this.speedFactor = 0.5;
    }

    draw() {
        this.parent.ctx.beginPath();
        this.parent.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.parent.ctx.fillStyle = this.color;
        this.parent.ctx.fill();
    }

    update() {

        if (this.x > this.parent.canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > this.parent.canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        if (this.parent.mousePosition.x != null && this.parent.mousePosition.y != null) {
            const dx = this.x - this.parent.mousePosition.x;
            const dy = this.y - this.parent.mousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.parent.mousePosition.radius) {

                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (this.parent.mousePosition.radius - distance) / this.parent.mousePosition.radius;

                const directionX = forceDirectionX * force * this.size * 0.45;
                const directionY = forceDirectionY * force * this.size * 0.45;

                this.x += directionX;
                this.y += directionY;
            }
        }

        this.x += this.directionX * this.speedFactor;
        this.y += this.directionY * this.speedFactor;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    new ParticleBackground();

    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {

            setTimeout(() => {
                const oldBg = document.querySelector('.interactive-bg');
                if (oldBg) oldBg.remove();
                new ParticleBackground();
            }, 100);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {

    const interactiveBg = document.querySelector('.interactive-background');
    if (interactiveBg) {
        interactiveBg.style.pointerEvents = 'none';

        const children = interactiveBg.querySelectorAll('*');
        children.forEach(child => {
            child.style.pointerEvents = 'none';
        });
    }

    const particles = document.querySelectorAll('.particle');
    const background = document.querySelector('.interactive-background');

    particles.forEach(particle => {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.transform = `translate(-50%, -50%) scale(${Math.random() * 0.5 + 0.5})`;
    });

    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            const deltaX = mouseX - particleX;
            const deltaY = mouseY - particleY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 200) {
                const force = (200 - distance) / 200;
                const moveX = (deltaX / distance) * force * 50;
                const moveY = (deltaY / distance) * force * 50;

                const currentLeft = parseFloat(particle.style.left);
                const currentTop = parseFloat(particle.style.top);

                particle.style.left = (currentLeft + moveX) + '%';
                particle.style.top = (currentTop + moveY) + '%';
            }
        });
    });

    particles.forEach(particle => {
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;

        particle.style.animation = `float ${duration}s infinite ease-in-out ${delay}s`;
    });
});