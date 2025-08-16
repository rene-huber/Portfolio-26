// Configuration
        const CONFIG = {
          timeZone: "Europe/Berlin",
          timeUpdateInterval: 1000
        };
// Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMobile = document.getElementById('navMobile');

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMobile.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        navMobile.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                menuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            }
        });

        // Time display
        function updateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        }

        // Update time every second
        updateTime();
        setInterval(updateTime, 1000);

        // Hide corner elements on scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercent = scrollTop / (documentHeight - windowHeight);
            
            const cornerElements = document.querySelector('.corner-elements22');
            
            // Hide when scrolled more than 50%
            if (scrollPercent > 0.5) {
                cornerElements.classList.add('hidden');
            } else {
                cornerElements.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop;
        });

        // Portfolio interactions
        const projectItems = document.querySelectorAll('.project-item');
        const backgroundImage = document.getElementById('backgroundImage');
        const portfolioContainer = document.querySelector('.portfolio-container');

        projectItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const imageSrc = this.getAttribute('data-image');
                if (imageSrc && backgroundImage) {
                    backgroundImage.style.backgroundImage = `url(${imageSrc})`;
                    backgroundImage.style.opacity = '0.8';
                    
                    // Add active state
                    portfolioContainer.classList.add('has-active');
                    this.classList.add('active');
                }
            });

            item.addEventListener('mouseleave', function() {
                if (backgroundImage) {
                    backgroundImage.style.opacity = '0';
                }
                
                // Remove active state
                portfolioContainer.classList.remove('has-active');
                this.classList.remove('active');
            });
        });

        // GSAP animations for content reveal
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            
            // Animate elements on scroll
            gsap.utils.toArray('h1, h2, p, img').forEach(element => {
                gsap.fromTo(element, 
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Welcome carousel animation
            gsap.utils.toArray('.welcome-word').forEach(word => {
                gsap.fromTo(word,
                    { opacity: 0, y: 100 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.5,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: ".welcome-carousel-container",
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
        }
