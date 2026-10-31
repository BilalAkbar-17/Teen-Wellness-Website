document.addEventListener('DOMContentLoaded', function() {

    const modeToggle = document.getElementById('modeToggle');
    const body = document.body;
    const mobileMenuToggle = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    const meterPointer = document.querySelector('.meter-pointer');
    const loginBtn = document.querySelector('.login-btn');

    function logout() {

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        window.location.href = 'index.html';
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName');

    if (loginBtn) {
        if (isLoggedIn && userName) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else {
            loginBtn.textContent = 'Login / Sign Up';
            loginBtn.href = 'login.html';
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    modeToggle.addEventListener('click', function() {
        if (body.classList.contains('light-mode') || !body.classList.contains('dark-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            modeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            this.innerHTML = navLinks.classList.contains('show') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const query = searchInput.value.trim();
        if (query.length > 0) {

            const searchText = query.toLowerCase();
            const found = findTextOnPage(searchText);

            if (!found) {
                alert('Text not found on this page.');
            }
        }
    }

    function findTextOnPage(searchText) {

        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body, 
            NodeFilter.SHOW_TEXT, 
            null, 
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        }

        for (const node of textNodes) {
            const content = node.nodeValue.toLowerCase();
            if (content.includes(searchText)) {

                const range = document.createRange();
                range.selectNode(node);
                const rect = range.getBoundingClientRect();

                window.scrollTo({
                    top: window.scrollY + rect.top - 100, 
                    behavior: 'smooth'
                });

                const parentElement = node.parentElement;
                const originalBackground = parentElement.style.backgroundColor;
                parentElement.style.backgroundColor = '#ffffd0'; 

                setTimeout(() => {
                    parentElement.style.backgroundColor = originalBackground;
                }, 2000);

                return true;
            }
        }

        return false;
    }

    let currentSlide = 0;

    function showSlide(index) {

        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
            testimonial.classList.remove('slide-in');
        });

        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        testimonials[index].style.display = 'block';

        setTimeout(() => {
            testimonials[index].classList.add('slide-in');
        }, 10);
        dots[index].classList.add('active');
        currentSlide = index;
    }

    if (prevBtn && nextBtn && testimonials.length > 0) {

        showSlide(0);

        nextBtn.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % testimonials.length;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
            showSlide(currentSlide);
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });
    }

    if (meterPointer) {

        meterPointer.style.transform = `translateX(-50%) rotate(0deg)`;

        window.removeEventListener('scroll', function() {
            const interactiveSection = document.querySelector('.interactive-section');
            if (!interactiveSection) return;

            const rect = interactiveSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible) {
                const scrollPercent = Math.min(100, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight * 100));
                const rotation = 30 + (scrollPercent / 100) * 120; 
                meterPointer.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                if (navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.topic-card, .stat-card, .testimonial-content');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            const isVisible = elementPosition.top < window.innerHeight - 100;

            if (isVisible) {
                element.classList.add('fade-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);

    animateOnScroll();

    function updateWellnessMeter(value) {
        const needle = document.querySelector('.meter-needle');
        if (needle) {

            const minDegree = -90;
            const maxDegree = 90;

            const clampedValue = Math.min(Math.max(value, 0), 100);

            const rotation = minDegree + (clampedValue / 100) * (maxDegree - minDegree);

            needle.style.transform = `rotate(${rotation}deg)`;
        }
    }

    function onQuizComplete(score) {

        const percentage = (score / 20) * 100;
        updateWellnessMeter(percentage);

    }
});