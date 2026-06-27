/* ==========================================================================
   FUSIONSITE - INTERACTIVE LOGIC, ROUTING & HIGH-END ANIMATION MOTIONS
   ========================================================================== */

(() => {

/* ==========================================================================
   1. SPA ROUTING & PAGE SYSTEM
   ========================================================================== */
function initSPARouting() {
    const pageViews = document.querySelectorAll('.page-view');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    // Main navigation function
    window.navigateToPage = function(pageId) {
        // Normalize pageId (strip hash if present)
        const targetId = pageId.replace('#', '');
        
        // Check if page element exists
        const targetPage = document.getElementById(targetId);
        if (!targetPage) return;

        // Toggle active views
        pageViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Timeout to allow smooth transition spacing
        setTimeout(() => {
            targetPage.classList.add('active');
            
            // Recalculate nav underline position once target view is ready
            setTimeout(updateNavUnderlinePosition, 50);
            
            // Re-trigger scroll reveal for the newly displayed page
            triggerPageScrollReveal(targetPage);
        }, 50);

        // Toggle nav links active states
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile drawer if open
        const drawer = document.getElementById('mobile-drawer');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            hamburgerBtn.classList.remove('open');
        }

        // Scroll to top of the page smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Push hash state to URL
        if (window.location.hash !== '#' + targetId) {
            history.pushState(null, null, '#' + targetId);
        }
    };

    // Listen to hash changes (for browser navigation)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#home';
        navigateToPage(hash);
    });

    // Handle initial load routing
    const initialHash = window.location.hash || '#home';
    navigateToPage(initialHash);

    // Bind all navigation links directly
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetPage = link.getAttribute('href');
            if (targetPage.startsWith('#')) {
                e.preventDefault();
                navigateToPage(targetPage);
            }
        });
    });
}

/* ==========================================================================
   2. MOBILE NAV DRAWER
   ========================================================================== */
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('mobile-drawer');

    hamburgerBtn.addEventListener('click', () => {
        drawer.classList.toggle('active');
        hamburgerBtn.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !hamburgerBtn.contains(e.target) && drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            hamburgerBtn.classList.remove('open');
        }
    });
}

// Add stylesheet rules for hamburger animation on open state
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .hamburger-menu.open .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
        background-color: var(--color-accent);
    }
    .hamburger-menu.open .bar:nth-child(2) {
        opacity: 0;
    }
    .hamburger-menu.open .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
        background-color: var(--color-accent);
    }
`;
document.head.appendChild(styleSheet);

/* ==========================================================================
   3. STICKY NAVBAR ON SCROLL
   ========================================================================== */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
let revealObserver;

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it contains statistics progress bar elements, animate them
                const barFills = entry.target.querySelectorAll('.stat-progress-fill');
                barFills.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.setProperty('--final-width', progress);
                    bar.style.width = progress;
                });

                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, options);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

function triggerPageScrollReveal(pageElement) {
    const revealElements = pageElement.querySelectorAll('.scroll-reveal:not(.revealed)');
    revealElements.forEach(el => {
        if (revealObserver) {
            revealObserver.observe(el);
        } else {
            el.classList.add('revealed');
        }
    });
}

/* ==========================================================================
   5. STATS ANIMATED COUNTER
   ========================================================================== */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const countOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const targetVal = parseInt(targetEl.getAttribute('data-target'), 10);
                animateCount(targetEl, targetVal);
                observer.unobserve(targetEl);
            }
        });
    }, countOptions);

    statNumbers.forEach(num => {
        counterObserver.observe(num);
    });
}

function animateCount(element, target) {
    let start = 0;
    const duration = 2000; // 2 seconds animation
    const stepTime = Math.abs(Math.floor(duration / target));
    
    const intervalTime = Math.max(stepTime, 10);
    const increment = Math.ceil(target / (duration / intervalTime));

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (target === 99 ? '%' : '+');
            clearInterval(timer);
        } else {
            element.textContent = start;
        }
    }, intervalTime);
}

/* ==========================================================================
   6. MANUFACTURING PROCESS STEPPER
   ========================================================================== */
function initProcessStepper() {
    const stepNodes = document.querySelectorAll('.step-node');
    const processSlides = document.querySelectorAll('.process-slide');
    const progressBarFill = document.getElementById('process-progress');

    stepNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stepNum = parseInt(node.getAttribute('data-step'), 10);
            
            // Update active node
            stepNodes.forEach(n => {
                const nStep = parseInt(n.getAttribute('data-step'), 10);
                if (nStep <= stepNum) {
                    n.classList.add('active');
                } else {
                    n.classList.remove('active');
                }
            });

            // Update progress bar
            const percent = ((stepNum - 1) / (stepNodes.length - 1)) * 100;
            progressBarFill.style.width = percent + '%';

            // Show corresponding content slide with transition delay
            processSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            const activeSlide = document.getElementById(`process-step-${stepNum}`);
            if (activeSlide) {
                setTimeout(() => {
                    activeSlide.classList.add('active');
                }, 50);
            }
        });
    });
}

/* ==========================================================================
   7. CONTACT RFQ VALIDATION & SUBMIT LOADING
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('rfq-form');
    if (!form) return;

    const formFields = form.querySelectorAll('input, select, textarea');
    const formSuccessAlert = document.getElementById('form-success-alert');
    const btnSubmit = document.getElementById('btn-submit-rfq');
    const btnResetForm = document.getElementById('btn-reset-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;

        formFields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Trigger Submitting visual loading state
            btnSubmit.classList.add('submitting');
            btnSubmit.disabled = true;

            // Mock API network call lag
            setTimeout(() => {
                btnSubmit.classList.remove('submitting');
                btnSubmit.disabled = false;
                
                // Transition to Success Card
                form.style.display = 'none';
                formSuccessAlert.style.display = 'block';
            }, 1800);
        }
    });

    // Remove validation marks on typing input
    formFields.forEach(field => {
        field.addEventListener('input', () => {
            const group = field.closest('.form-group');
            if (group && group.classList.contains('invalid')) {
                validateField(field);
            }
        });
    });

    // Reset Form view
    if (btnResetForm) {
        btnResetForm.addEventListener('click', () => {
            resetFormView();
        });
    }

    window.resetFormView = function() {
        form.reset();
        formFields.forEach(field => {
            const group = field.closest('.form-group');
            if (group) group.classList.remove('invalid');
        });
        form.style.display = 'block';
        formSuccessAlert.style.display = 'none';
    };
}

function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return true;

    let isValid = true;

    if (field.required) {
        if (!field.value || field.value.trim() === '') {
            isValid = false;
        }
    }

    if (isValid && field.type === 'email') {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(field.value.trim())) {
            isValid = false;
        }
    }

    if (isValid) {
        group.classList.remove('invalid');
    } else {
        group.classList.add('invalid');
    }

    return isValid;
}

/* ==========================================================================
   8. HERO CANVAS PARTICLE ENGINE (HIGH PERFORMANCE)
   ========================================================================== */
function initHeroParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationFrameId;

    // Track mouse coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120 // Interaction distance
    };

    const container = document.getElementById('hero-interactive');

    container.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        initParticles();
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Check canvas boundaries
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interact pushing logic
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    
                    // Flee push speed
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * 3;
                    const directionY = forceDirectionY * force * 3;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        // Particle density mapping to canvas size
        let numberOfParticles = Math.floor((canvas.width * canvas.height) / 11000);
        numberOfParticles = Math.min(Math.max(numberOfParticles, 40), 100);

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            // Slight color variation (accent or primary steel)
            let color = Math.random() > 0.85 ? 'rgba(255, 107, 53, 0.45)' : 'rgba(96, 114, 140, 0.25)';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Draw lines connecting particles
    function connect() {
        let opacityValue = 1;
        const maxDist = 120;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDist) {
                    opacityValue = 1 - (distance / maxDist);
                    ctx.strokeStyle = `rgba(96, 114, 140, ${opacityValue * 0.18})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        animationFrameId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
}

/* ==========================================================================
   9. HERO TAGLINE TYPING ANIMATION
   ========================================================================== */
function initTaglineTyping() {
    const textElement = document.getElementById('typing-tagline');
    if (!textElement) return;

    const words = [
        "Precision Machining Components.",
        "Heavy-Duty Metal Fabrication Solutions.",
        "Advanced Engineering Consultancies.",
        "Bespoke Manufacturing Prototypes."
    ];
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let delay = 100; // Base delay typing speed

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            delay = 40; // Deleting speed
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            delay = 80; // Typing speed
        }

        // Handle word boundaries
        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            delay = 1800; // Wait before starting delete
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 500; // Gap before typing next word
        }

        setTimeout(type, delay);
    }

    type();
}

/* ==========================================================================
   10. NAVIGATION SLIDING UNDERLINE EFFECT
   ========================================================================== */
let updateNavUnderlinePosition;

function initNavUnderlineEffect() {
    const underline = document.getElementById('nav-underline');
    const menuLinks = document.querySelectorAll('.desktop-nav .nav-link:not(.nav-btn)');
    
    if (!underline || menuLinks.length === 0) return;

    updateNavUnderlinePosition = function() {
        const activeLink = document.querySelector('.desktop-nav .nav-link.active:not(.nav-btn)');
        if (activeLink) {
            underline.style.left = activeLink.offsetLeft + 'px';
            underline.style.width = activeLink.offsetWidth + 'px';
            underline.style.opacity = '1';
        } else {
            underline.style.opacity = '0';
        }
    };

    // Calculate position on page load / view switch
    updateNavUnderlinePosition();
    window.addEventListener('resize', updateNavUnderlinePosition);

    // Slide line on hover
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            underline.style.left = link.offsetLeft + 'px';
            underline.style.width = link.offsetWidth + 'px';
        });

        link.addEventListener('mouseleave', () => {
            // Restore position to active link
            updateNavUnderlinePosition();
        });
    });
}

/* ==========================================================================
   11. PREMIUM 3D TILT EFFECT & MOUSE LIGHTING
   ========================================================================== */
function init3DTiltEffect() {
    const tiltCards = document.querySelectorAll('[data-tilt], .hover-tilt');
    
    tiltCards.forEach(card => {
        const glow = card.querySelector('.glowing-border-overlay');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Mouse coordinate relative to card offset center
            const mouseX = e.clientX - rect.left - (width / 2);
            const mouseY = e.clientY - rect.top - (height / 2);
            
            // Limit tilt values (Max 12 degrees)
            const rotateX = -12 * (mouseY / (height / 2));
            const rotateY = 12 * (mouseX / (width / 2));
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
            card.style.zIndex = '5';
            
            // Adjust overlay radial gradient centering position
            if (glow) {
                const glowX = e.clientX - rect.left;
                const glowY = e.clientY - rect.top;
                glow.style.background = `radial-gradient(250px circle at ${glowX}px ${glowY}px, rgba(255, 107, 53, 0.15), transparent 80%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Smoothly reset tilt state
            card.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
            card.style.zIndex = '1';
            if (glow) {
                glow.style.background = 'radial-gradient(200px circle at 0px 0px, rgba(255, 107, 53, 0.1), transparent 80%)';
            }
        });
    });
}

/* ==========================================================================
   12. AUTO-SLIDING TESTIMONIAL CAROUSEL
   ========================================================================== */
function initTestimonialCarousel() {
    const slider = document.getElementById('testimonial-carousel-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let autoSlideInterval;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % slides.length;
            showSlide(nextIndex);
        }, 5000); // Transitions slide every 5 seconds
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Attach dot click listeners
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            const index = parseInt(dot.getAttribute('data-index'), 10);
            showSlide(index);
            startAutoSlide();
        });
    });

    // Pause carousel slides on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Initialize
    showSlide(0);
    startAutoSlide();
}

/* ==========================================================================
   13. SCROLL-TRIGGERED TIMELINE PROGRESS FILL
   ========================================================================== */
function initTimelineProgressBar() {
    const timeline = document.querySelector('.timeline-container');
    const fillBar = document.getElementById('timeline-progress-bar');
    
    if (!timeline || !fillBar) return;

    window.addEventListener('scroll', () => {
        const rect = timeline.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Element scroll coordinate ratio mapping
        const startOffset = rect.top - viewportHeight;
        const totalHeight = rect.height;
        
        if (startOffset < 0) {
            let progress = Math.abs(startOffset) / (totalHeight + viewportHeight * 0.2);
            progress = Math.min(Math.max(progress * 100, 0), 100);
            fillBar.style.height = progress + '%';
        } else {
            fillBar.style.height = '0%';
        }
    });
}

/* ==========================================================================
   14. MAGNETIC BUTTON MICRO-INTERACTION
   ========================================================================== */
function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const dx = mouseX - btnX;
            const dy = mouseY - btnY;
            
            // magnetic translation vector (Max 15px pull offset)
            const pullX = dx * 0.35;
            const pullY = dy * 0.35;
            
            btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.02)`;
            btn.style.boxShadow = '0 10px 25px rgba(255, 107, 53, 0.25)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
        });
    });
}

/* ==========================================================================
   15. MOUSE PARALLAX EFFECT FOR HERO LAYERS
   ========================================================================== */
function initHeroParallax() {
    const container = document.getElementById('hero-interactive');
    const layers = document.querySelectorAll('.hero-parallax-layer, .kpi-wrapper');
    
    if (!container || layers.length === 0) return;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        
        // Mouse offset ratio relative to center of hero view
        const mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        
        layers.forEach(layer => {
            const depth = parseFloat(layer.getAttribute('data-depth')) || 0.1;
            
            // Calculate translation offset (Max 40px translation at depth 1.0)
            const translateX = mouseX * 40 * depth;
            const translateY = mouseY * 40 * depth;
            
            // Apply translation offset
            layer.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
    });

    container.addEventListener('mouseleave', () => {
        layers.forEach(layer => {
            layer.style.transform = 'translate(0px, 0px)';
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================
// initSPARouting(); // Disabled to allow all sections on single page
initMobileMenu();
initStickyHeader();
initScrollReveal();
initStatsCounter();
initProcessStepper();
initContactForm();

// Premium Animations & Visual Effects
initHeroParticles();
initTaglineTyping();
// initNavUnderlineEffect(); // Disabled as it relies on SPA routing state
init3DTiltEffect();
initTestimonialCarousel();
initTimelineProgressBar();
initMagneticButtons();
initHeroParallax();

})();
