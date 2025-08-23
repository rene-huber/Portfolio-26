
        // NAVEGACIÓN ACTIVA CON UNDERLINE
        function setActiveMenuItem() {
            const currentPage = getCurrentPageName();
            
            // Remover clase active de todos los links
            document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Agregar clase active al link correspondiente
            document.querySelectorAll(`[data-page="${currentPage}"]`).forEach(link => {
                link.classList.add('active');
            });
        }

        function getCurrentPageName() {
            const path = window.location.pathname;
            const page = path.split('/').pop() || 'index.html';
            
            // Mapear archivos a nombres de página
            const pageMap = {
                'index.html': 'home',
                '': 'home', // Para cuando está en la raíz
                'about.html': 'about',
                'portfolio.html': 'portfolio', 
                'contact.html': 'contact'
            };
            
            return pageMap[page] || 'home';
        }

        // Ejecutar al cargar la página
        document.addEventListener('DOMContentLoaded', setActiveMenuItem);



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
       /* let lastScrollTop = 0;
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
*/
// Hide footer elements on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const footerElements = document.querySelector('.footer-corner-elements');
    
    // Si el elemento existe, aplica la lógica
    if (footerElements) {
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            footerElements.classList.add('hidden');
        } else {
            // Scrolling up
            footerElements.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }
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
// Función para carrusel de imágenes con efecto glitch
function startImageCarousel() {
    console.log('🚀 Iniciando función startImageCarousel');
    
    const imageElement = document.querySelector('.foto');
    console.log('📷 Elemento imagen encontrado:', imageElement);
    
    if (!imageElement) {
        console.error('❌ No se encontró la imagen con clase .foto');
        return;
    }

    // Array con tus 3 imágenes
    const imageUrls = [
        'tapas.jpg',
        'ojo.jpg'
    ];
    
    console.log('📂 URLs de imágenes:', imageUrls);

    let currentIndex = 0;

    function changeImage() {
        console.log(`🔄 Cambiando imagen. Índice actual: ${currentIndex}`);
        console.log(`📷 Nueva imagen: ${imageUrls[currentIndex]}`);
        
        // Cambiar solo el src de la imagen existente
        imageElement.src = imageUrls[currentIndex];
        imageElement.alt = `Imagen ${currentIndex + 1}`;
        
        // Incrementar índice para la siguiente imagen
        currentIndex = (currentIndex + 1) % imageUrls.length;
        
        console.log(`➡️ Próximo índice será: ${currentIndex}`);
    }

    console.log('⏰ Configurando intervalo de 5 segundos');
    // Cambiar imagen cada 5 segundos
    setInterval(changeImage, 5000);
    
    console.log('✅ Carrusel configurado correctamente');
}

// Llamar a la función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM cargado, llamando startImageCarousel');
    startImageCarousel();
});