// Configuration
        const CONFIG = {
          timeZone: "Europe/Berlin",
          timeUpdateInterval: 1000
        };

        // Mobile Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMobile = document.getElementById('navMobile');

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMobile.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const mobileNavLinks = navMobile.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });

        // Utility function to detect mobile devices
        function isMobile() {
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 window.innerWidth <= 768;
        }

        // Animation Manager Class
        class AnimationManager {
          constructor() {
            this.backgroundImage = document.getElementById("backgroundImage");
            this.projectItems = document.querySelectorAll(".project-item");
            this.portfolioContainer = document.querySelector(".portfolio-container");
            this.currentActiveIndex = -1;
            this.originalTexts = new Map();
            this.debounceTimeout = null;
            this.idleAnimation = null;
            this.isIdle = true;
            this.idleTimer = null;
            
            // Mobile touch functionality
            this.isMobileDevice = isMobile();
            this.touchStartTime = 0;
            this.touchHoldTimer = null;
            this.isHolding = false;
            this.activeTouch = null;
            this.touchHoldDelay = 200; // ms to start showing image

            // Store original texts for each project item
            this.projectItems.forEach((item) => {
              const textElements = item.querySelectorAll(".hover-text");
              const texts = Array.from(textElements).map((el) => el.textContent);
              this.originalTexts.set(item, texts);
            });
          }

          initializeAnimations() {
            this.preloadImages();
            this.projectItems.forEach((item, index) => {
              this.addEventListeners(item, index);
            });

            // Add container mouse leave event (only for desktop)
            if (!this.isMobileDevice) {
              const container = document.querySelector(".portfolio-container");
              container.addEventListener("mouseleave", () => {
                if (this.debounceTimeout) {
                  clearTimeout(this.debounceTimeout);
                }
                this.clearActiveStates();
                this.hideBackgroundImage();
                this.startIdleTimer();
              });
            }

            this.startIdleTimer();
          }

          preloadImages() {
            this.projectItems.forEach((item) => {
              const imageUrl = item.dataset.image;
              if (imageUrl) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = imageUrl;
              }
            });
          }

          addEventListeners(item, index) {
            const textElements = item.querySelectorAll(".hover-text");
            const imageUrl = item.dataset.image;
            const originalTexts = this.originalTexts.get(item);

            if (this.isMobileDevice) {
              // Mobile touch events
              this.addMobileTouchEvents(item, index, textElements, originalTexts, imageUrl);
            } else {
              // Desktop mouse events
              this.addDesktopMouseEvents(item, index, textElements, originalTexts, imageUrl);
            }
          }

          addMobileTouchEvents(item, index, textElements, originalTexts, imageUrl) {
            // Touch start - begin hold detection
            item.addEventListener('touchstart', (e) => {
              e.preventDefault(); // Prevent scrolling
              
              this.touchStartTime = Date.now();
              this.activeTouch = {
                item,
                index,
                textElements,
                originalTexts,
                imageUrl
              };

              // Clear any existing timer
              if (this.touchHoldTimer) {
                clearTimeout(this.touchHoldTimer);
              }

              // Start hold timer
              this.touchHoldTimer = setTimeout(() => {
                if (this.activeTouch && this.activeTouch.item === item) {
                  this.isHolding = true;
                  this.activateItem(index, textElements, originalTexts, imageUrl);
                }
              }, this.touchHoldDelay);

            }, { passive: false });

            // Touch end - stop showing image
            item.addEventListener('touchend', (e) => {
              e.preventDefault();
              
              // Clear hold timer
              if (this.touchHoldTimer) {
                clearTimeout(this.touchHoldTimer);
                this.touchHoldTimer = null;
              }

              // If we were holding, deactivate
              if (this.isHolding && this.activeTouch && this.activeTouch.item === item) {
                this.deactivateItem(textElements, originalTexts);
                this.hideBackgroundImage();
                this.isHolding = false;
              }

              this.activeTouch = null;
            }, { passive: false });

            // Touch cancel - same as touch end
            item.addEventListener('touchcancel', (e) => {
              e.preventDefault();
              
              if (this.touchHoldTimer) {
                clearTimeout(this.touchHoldTimer);
                this.touchHoldTimer = null;
              }

              if (this.isHolding && this.activeTouch && this.activeTouch.item === item) {
                this.deactivateItem(textElements, originalTexts);
                this.hideBackgroundImage();
                this.isHolding = false;
              }

              this.activeTouch = null;
            }, { passive: false });

            // Touch move - cancel if moved too much
            item.addEventListener('touchmove', (e) => {
              const touch = e.touches[0];
              const rect = item.getBoundingClientRect();
              
              // If touch moves outside the item, cancel
              if (touch.clientX < rect.left || touch.clientX > rect.right ||
                  touch.clientY < rect.top || touch.clientY > rect.bottom) {
                
                if (this.touchHoldTimer) {
                  clearTimeout(this.touchHoldTimer);
                  this.touchHoldTimer = null;
                }

                if (this.isHolding && this.activeTouch && this.activeTouch.item === item) {
                  this.deactivateItem(textElements, originalTexts);
                  this.hideBackgroundImage();
                  this.isHolding = false;
                }

                this.activeTouch = null;
              }
            }, { passive: false });
          }

          addDesktopMouseEvents(item, index, textElements, originalTexts, imageUrl) {
            const handleMouseEnter = () => {
              this.stopIdleAnimation();
              this.stopIdleTimer();
              this.isIdle = false;

              if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
              }

              if (this.currentActiveIndex === index) return;

              this.activateItem(index, textElements, originalTexts, imageUrl);
            };

            const handleMouseLeave = () => {
              this.debounceTimeout = setTimeout(() => {
                this.deactivateItem(textElements, originalTexts);
              }, 50);
            };

            item.addEventListener("mouseenter", handleMouseEnter);
            item.addEventListener("mouseleave", handleMouseLeave);
          }

          activateItem(index, textElements, originalTexts, imageUrl) {
            this.stopIdleAnimation();
            this.stopIdleTimer();
            this.isIdle = false;

            if (this.debounceTimeout) {
              clearTimeout(this.debounceTimeout);
            }

            this.updateActiveStates(index);

            // Animate text with scramble effect
            textElements.forEach((element, i) => {
              if (typeof gsap !== 'undefined' && gsap.to) {
                gsap.killTweensOf(element);
                gsap.to(element, {
                  duration: 0.8,
                  scrambleText: {
                    text: originalTexts[i],
                    chars: "qwerty1337h@ck3r",
                    revealDelay: 0.3,
                    speed: 0.4
                  }
                });
              }
            });

            if (imageUrl) {
              this.showBackgroundImage(imageUrl);
            }
          }

          deactivateItem(textElements, originalTexts) {
            textElements.forEach((element, i) => {
              if (typeof gsap !== 'undefined') {
                gsap.killTweensOf(element);
              }
              element.textContent = originalTexts[i];
            });
          }

          updateActiveStates(activeIndex) {
            this.currentActiveIndex = activeIndex;
            this.portfolioContainer.classList.add("has-active");

            this.projectItems.forEach((item, index) => {
              if (index === activeIndex) {
                item.classList.add("active");
              } else {
                item.classList.remove("active");
              }
            });
          }

          clearActiveStates() {
            this.currentActiveIndex = -1;
            this.portfolioContainer.classList.remove("has-active");

            this.projectItems.forEach((item) => {
              item.classList.remove("active");
              const textElements = item.querySelectorAll(".hover-text");
              const originalTexts = this.originalTexts.get(item);

              textElements.forEach((element, i) => {
                if (typeof gsap !== 'undefined') {
                  gsap.killTweensOf(element);
                }
                element.textContent = originalTexts[i];
              });
            });

            if (!this.isMobileDevice) {
              this.startIdleTimer();
            }
          }

          showBackgroundImage(imageUrl) {
            // Reset transform and transition
            this.backgroundImage.style.transition = "none";
            this.backgroundImage.style.transform = "translate(-50%, -50%) scale(1.2)";

            // Set the background image and show it
            this.backgroundImage.style.backgroundImage = `url(${imageUrl})`;
            this.backgroundImage.style.opacity = "1";

            // Force browser to acknowledge the scale reset before animating
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Re-enable transition and animate to scale 1.0
                this.backgroundImage.style.transition =
                  "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                this.backgroundImage.style.transform =
                  "translate(-50%, -50%) scale(1.0)";
              });
            });
          }

          hideBackgroundImage() {
            this.backgroundImage.style.opacity = "0";
          }

          startIdleTimer() {
            if (this.isMobileDevice) return; // No idle animation on mobile
            
            this.stopIdleTimer();
            this.idleTimer = setTimeout(() => {
              if (this.currentActiveIndex === -1) {
                this.isIdle = true;
                this.startIdleAnimation();
              }
            }, 3000);
          }

          stopIdleTimer() {
            if (this.idleTimer) {
              clearTimeout(this.idleTimer);
              this.idleTimer = null;
            }
          }

          startIdleAnimation() {
            if (this.idleAnimation || typeof gsap === 'undefined' || this.isMobileDevice) return;

            this.idleAnimation = gsap.timeline({
              repeat: -1,
              repeatDelay: 2
            });

            const columnElements = {
              artists: [...this.projectItems].map((item) =>
                item.querySelector(".artist")
              ),
              albums: [...this.projectItems].map((item) =>
                item.querySelector(".album")
              ),
              categories: [...this.projectItems].map((item) =>
                item.querySelector(".category")
              ),
              labels: [...this.projectItems].map((item) =>
                item.querySelector(".label")
              ),
              years: [...this.projectItems].map((item) => item.querySelector(".year"))
            };

            const totalRows = this.projectItems.length;
            const columnStartDelay = 0.25;
            const rowDelay = 0.05;
            const hideShowGap = totalRows * rowDelay * 0.5;

            // Animate counter visibility
            this.projectItems.forEach((item, rowIndex) => {
              const hideTime = 0 + rowIndex * rowDelay;
              const showTime = 0 + hideShowGap + rowIndex * rowDelay;

              this.idleAnimation.call(
                () => {
                  item.classList.add("counter-hidden");
                },
                [],
                hideTime
              );

              this.idleAnimation.call(
                () => {
                  item.classList.remove("counter-hidden");
                },
                [],
                showTime
              );
            });

            // Animate columns
            Object.keys(columnElements).forEach((columnName, columnIndex) => {
              const elements = columnElements[columnName];
              const columnStart = (columnIndex + 1) * columnStartDelay;

              // Hide elements
              elements.forEach((element, rowIndex) => {
                const hideTime = columnStart + rowIndex * rowDelay;
                this.idleAnimation.to(
                  element,
                  {
                    duration: 0.1,
                    opacity: 0.05,
                    ease: "power2.inOut"
                  },
                  hideTime
                );
              });

              // Show elements
              elements.forEach((element, rowIndex) => {
                const showTime = columnStart + hideShowGap + rowIndex * rowDelay;
                this.idleAnimation.to(
                  element,
                  {
                    duration: 0.1,
                    opacity: 1,
                    ease: "power2.inOut"
                  },
                  showTime
                );
              });
            });
          }

          stopIdleAnimation() {
            if (this.idleAnimation) {
              this.idleAnimation.kill();
              this.idleAnimation = null;
              
              // Reset all elements to visible
              if (typeof gsap !== 'undefined') {
                gsap.set([...document.querySelectorAll(".project-data")], {
                  opacity: 1
                });
              }
              
              this.projectItems.forEach((item) => {
                item.classList.remove("counter-hidden");
              });
            }
          }
        }

        // Time Display Class
        class TimeDisplay {
          constructor(elementId) {
            this.element = document.getElementById(elementId);
            if (!this.element) {
              throw new Error(`Element with id '${elementId}' not found.`);
            }
          }

          start() {
            this.updateDisplay();
            setInterval(() => this.updateDisplay(), CONFIG.timeUpdateInterval);
          }

          updateDisplay() {
            const { hours, minutes, dayPeriod } = this.getCurrentTime();
            const timeString = `${hours}<span class="time-blink">:</span>${minutes} ${dayPeriod}`;
            this.element.innerHTML = timeString;
          }

          getCurrentTime() {
            const now = new Date();
            const options = {
              timeZone: CONFIG.timeZone,
              hour12: true,
              hour: "numeric",
              minute: "numeric",
              second: "numeric"
            };

            const formatter = new Intl.DateTimeFormat("en-US", options);
            const parts = formatter.formatToParts(now);

            return {
              hours: parts.find((part) => part.type === "hour").value,
              minutes: parts.find((part) => part.type === "minute").value,
              dayPeriod: parts.find((part) => part.type === "dayPeriod").value
            };
          }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener("DOMContentLoaded", () => {
          const animationManager = new AnimationManager();
          animationManager.initializeAnimations();

          const timeDisplay = new TimeDisplay("current-time");
          timeDisplay.start();
        });

        // Agregar esta clase al final de script_2.js

// Welcome Carousel Class
class WelcomeCarousel {
    constructor() {
        this.carousel = document.getElementById('welcomeCarousel');
        this.container = document.querySelector('.welcome-carousel-container');
        this.words = document.querySelectorAll('.welcome-word');
        this.isVisible = false;
        this.observer = null;
        
        this.init();
    }

    init() {
        // Configurar Intersection Observer para optimizar performance
        this.setupIntersectionObserver();
        
        // Añadir efectos hover adicionales
        this.setupHoverEffects();
        
        // Configurar pausa en focus para accesibilidad
        this.setupAccessibilityFeatures();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startAnimation();
                    this.isVisible = true;
                } else {
                    this.pauseAnimation();
                    this.isVisible = false;
                }
            });
        }, options);

        this.observer.observe(this.container);
    }

    setupHoverEffects() {
        // Solo agregar efecto glow, sin pausar animación
        this.container.addEventListener('mouseenter', () => {
            this.addGlowEffect();
        });

        this.container.addEventListener('mouseleave', () => {
            this.removeGlowEffect();
        });
    }

    setupAccessibilityFeatures() {
        // Respetar preferencias de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.pauseAnimation();
            this.container.style.setProperty('--animation-duration', '60s');
        }
        // Removidos los event listeners de teclado que pausaban la animación
    }

    startAnimation() {
        this.carousel.style.animationPlayState = 'running';
    }

    pauseAnimation() {
        this.carousel.style.animationPlayState = 'paused';
    }

    resumeAnimation() {
        if (this.isVisible) {
            this.carousel.style.animationPlayState = 'running';
        }
    }

    addGlowEffect() {
        this.words.forEach(word => {
            word.style.textShadow = '0 0 20px rgba(255, 223, 0, 0.5), 0 0 40px rgba(255, 223, 0, 0.3)';
            word.style.transition = 'text-shadow 0.3s ease';
        });
    }

    removeGlowEffect() {
        this.words.forEach(word => {
            word.style.textShadow = 'none';
        });
    }

    // Método público para cambiar la velocidad de la animación
    setSpeed(duration) {
        this.carousel.style.animationDuration = `${duration}s`;
    }

    // Método público para destruir el observer
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Modificar la inicialización en el DOMContentLoaded existente
document.addEventListener("DOMContentLoaded", () => {
    const animationManager = new AnimationManager();
    animationManager.initializeAnimations();

    const timeDisplay = new TimeDisplay("current-time");
    timeDisplay.start();
    
    // Inicializar el carrusel Welcome
    const welcomeCarousel = new WelcomeCarousel();
    
    // Opcional: Cambiar velocidad basado en el tamaño de pantalla
    const handleResize = () => {
        if (window.innerWidth <= 480) {
            welcomeCarousel.setSpeed(25); // Más lento en móviles pequeños
        } else if (window.innerWidth <= 768) {
            welcomeCarousel.setSpeed(20); // Moderado en tablets
        } else {
            welcomeCarousel.setSpeed(15); // Velocidad normal en desktop
        }
    };
    
    // Ejecutar al cargar y redimensionar
    handleResize();
    window.addEventListener('resize', handleResize);
});

