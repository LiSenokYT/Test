// Enhanced Vehicle Details Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });

    // Gallery functionality
    const slides = document.querySelectorAll('.gallery-slide');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideEl = document.getElementById('currentSlide');
    const totalSlidesEl = document.getElementById('totalSlides');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Если слайдов нет — пропускаем и выходим
    if (!totalSlides || totalSlides === 0) {
        if (totalSlidesEl) {totalSlidesEl.textContent = 0;}
        return;
    }

    totalSlidesEl.textContent = totalSlides;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Show current slide
        slides[index].classList.add('active');
        thumbnails[index].classList.add('active');
        currentSlideEl.textContent = index + 1;
        currentSlide = index;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Event listeners for gallery (guards)
    if (nextBtn) {nextBtn.addEventListener('click', nextSlide);}
    if (prevBtn) {prevBtn.addEventListener('click', prevSlide);}

    if (thumbnails && thumbnails.length) {
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => showSlide(index));
        });
    }
    
    // Keyboard navigation for gallery
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {prevSlide();}
        if (e.key === 'ArrowRight') {nextSlide();}
    });

    // Expandable history functionality
    const expandButtons = document.querySelectorAll('.expand-history-btn');
    
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const historyId = this.getAttribute('data-history');
            const details = document.getElementById(`history-${historyId}`);
            
            this.classList.toggle('active');
            details.classList.toggle('active');
            
            // Update button text
            const span = this.querySelector('span:first-child');
            if (details.classList.contains('active')) {
                span.textContent = 'Скрыть детали';
            } else {
                span.textContent = this.getAttribute('data-original-text') || 'Подробнее';
            }
        });
        
        // Store original text
        const originalText = button.querySelector('span:first-child').textContent;
        button.setAttribute('data-original-text', originalText);
    });

    // Floating navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Smooth scrolling for navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial call
    updateActiveNav();

    // Add animation to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.1 });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    console.log('Enhanced vehicle details page loaded! 🎯');
});
