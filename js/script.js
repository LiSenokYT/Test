// Main JavaScript for Archive Broni website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initCounterAnimation();
    initDomainCards();
    initFeaturedCards();
    initSearch();
});

// Navigation functionality
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    // Smooth scrolling only for anchor links on home page
    if (navLinksItems && navLinksItems.length) {
        navLinksItems.forEach(link => {
            link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's an anchor link on the same page (starts with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    navLinksItems.forEach(item => item.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Close mobile menu if open
                    if (navLinks && navLinks.classList.contains('active') && mobileMenuBtn) {
                        navLinks.classList.remove('active');
                        mobileMenuBtn.textContent = '☰';
                    }
                }
            }
            // For external links (pages), let them work normally
            // but close mobile menu if open
            else {
                if (navLinks && navLinks.classList.contains('active') && mobileMenuBtn) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.textContent = '☰';
                }
            }
        });
        });
    }
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        updateActiveNavLink();

        // Header background on scroll (guard)
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(10, 10, 10, 0.98)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            }
        }
    });
    
    // Set initial active state based on URL hash
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinksItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Scroll animations and effects
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.domain-card, .featured-card, .stat-item');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add CSS for visible state
    if (!document.querySelector('#scroll-animations-style')) {
        const style = document.createElement('style');
        style.id = 'scroll-animations-style';
        style.textContent = `
            .domain-card.visible,
            .featured-card.visible,
            .stat-item.visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Parallax effect for hero background (less layout-jank)
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-background');
        if (heroBg) {
            const parallaxSpeed = 0.3;
            heroBg.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// Animated counter for statistics
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // 2 seconds
                const step = target / (duration / 16); // 60fps
                let current = 0;
                
                const timer = setInterval(function() {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current).toLocaleString();
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Domain cards interaction
function initDomainCards() {
    const domainCards = document.querySelectorAll('.domain-card');
    
    domainCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
            const background = this.querySelector('.domain-background');
            if (background) {
                background.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
            const background = this.querySelector('.domain-background');
            if (background) {
                background.style.transform = 'scale(1)';
            }
        });
        
        // Click handler for domain cards
        card.addEventListener('click', function(e) {
            // Only navigate if not clicking on a link
            if (!e.target.closest('a')) {
                const domain = this.getAttribute('data-domain');
                const link = this.querySelector('a.domain-btn');
                if (link) {
                    link.click();
                }
            }
        });
        
        // Add pulse animation on hover
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.domain-icon');
            if (icon) {
                icon.style.animation = 'pulse 1s ease-in-out';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.domain-icon');
            if (icon) {
                icon.style.animation = '';
            }
        });
    });
    
    // Add pulse animation
    if (!document.querySelector('#pulse-animation-style')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation-style';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Featured cards interaction
function initFeaturedCards() {
    const featuredCards = document.querySelectorAll('.featured-card');
    
    featuredCards.forEach(card => {
        // Tilt effect on mouse move
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = (x - centerX) / 25;
            const rotateX = (centerY - y) / 25;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(-5px)';
        });
        
        // Click handler for featured cards
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('card-btn')) {
                const vehicleName = this.querySelector('.card-title').textContent;
                // Here you can add navigation to vehicle detail page
                console.log('Navigate to vehicle:', vehicleName);
                // window.location.href = `/vehicle/${encodeURIComponent(vehicleName.toLowerCase())}`;
            }
        });
        
        // Button click handler
        const button = card.querySelector('.card-btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const vehicleName = card.querySelector('.card-title').textContent;
                console.log('View details for:', vehicleName);
                // window.location.href = `/vehicle/${encodeURIComponent(vehicleName.toLowerCase())}`;
            });
        }
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                // For now, just log the search and keep the input value
                console.log('Search query:', query);

                // Show search feedback
                showSearchFeedback(query);

                // In future, redirect to search results
                // window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add focus effect
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.borderColor = 'var(--accent-primary)';
            this.parentElement.style.boxShadow = '0 0 0 2px rgba(140, 47, 57, 0.2)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            this.parentElement.style.boxShadow = 'none';
        });
    }
}

// Show search feedback
function showSearchFeedback(query) {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'search-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <span>Поиск: "${query}" - функция в разработке</span>
            <button type="button" class="feedback-close">✕</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#search-feedback-style')) {
        const style = document.createElement('style');
        style.id = 'search-feedback-style';
        style.textContent = `
            .search-feedback {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--accent-primary);
                color: white;
                padding: 1rem;
                border-radius: var(--border-radius);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                animation: slideInRight 0.3s ease-out;
            }
            .feedback-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .feedback-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1rem;
                padding: 0;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    // Add close event
    feedback.querySelector('.feedback-close').addEventListener('click', function() {
        feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }, 5000);
}

// CTA buttons interaction
function initCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (this.classList.contains('primary')) {
                this.style.boxShadow = '0 15px 35px rgba(140, 47, 57, 0.4)';
            } else {
                this.style.boxShadow = '0 15px 35px rgba(13, 59, 102, 0.4)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
        
        // Ripple effect
        button.addEventListener('click', function(e) {
            // Only for buttons that aren't links
            if (!this.hasAttribute('href')) {
                createRippleEffect(e, this);
            }
        });
    });
}

// Ripple effect for buttons
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Add ripple styles if not already added
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .cta-button {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Mobile menu improvements
function initMobileMenu() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMobileChange(e) {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!e.matches) {
            // Desktop - ensure menu is visible
            navLinks.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.textContent = '☰';
            }
        }
    }
    
    mediaQuery.addListener(handleMobileChange);
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu-btn')) {
            navLinks.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.textContent = '☰';
            }
        }
    });
}

// Preload images for better performance
function preloadImages() {
    const images = [
        // Add paths to critical images here
        // 'assets/images/hero-bg.jpg',
        // 'assets/images/ground-bg.jpg',
        // etc.
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Performance optimization - lazy loading for non-critical elements
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    lazyObserver.unobserve(element);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyObserver.observe(img);
        });
    }
}

// Initialize all components
function initializeAll() {
    initNavigation();
    initScrollEffects();
    initCounterAnimation();
    initDomainCards();
    initFeaturedCards();
    initSearch();
    initCTAButtons();
    initMobileMenu();
    preloadImages();
    initLazyLoading();
}

// Export functions for global access
window.ArchiveBroni = {
    initNavigation,
    initScrollEffects,
    initCounterAnimation,
    initDomainCards,
    initFeaturedCards,
    initSearch,
    initCTAButtons,
    initMobileMenu,
    preloadImages,
    initLazyLoading,
    initializeAll
};

// Re-initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    initializeAll();
}

// Handle page transitions
function handlePageTransition(url) {
    const mainContent = document.querySelector('main') || document.body;
    
    // Add fade out animation
    mainContent.style.opacity = '0';
    mainContent.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Add smooth page transitions for internal links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && link.href.includes(window.location.origin)) {
        e.preventDefault();
        handlePageTransition(link.href);
    }
});

// Utility function for loading states
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
        element.innerHTML = '<div class="loading-spinner-small"></div>';
    } else {
        element.classList.remove('loading');
        element.disabled = false;
        // Restore original content - you might want to store it in data attribute
    }
}

// Add small loading spinner styles
if (!document.querySelector('#loading-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-style';
    style.textContent = `
        .loading-spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}
