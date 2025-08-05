// ================================
// CONFIGURATION
// ================================
const CONFIG = {
  timeZone: "Europe/Zagreb",
  timeUpdateInterval: 1000
};

// ================================
// VFX DISTORTION EFFECTS
// ================================
class VFXManager {
  constructor() {
    this.vfx = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const { VFX } = await import("https://esm.sh/@vfx-js/core@0.8.0");
      
      const shader = `
        precision highp float;
        uniform sampler2D src;
        uniform vec2 offset;
        uniform vec2 resolution;
        uniform float time;
        out vec4 outColor;

        vec4 readTex(vec2 uv) {  
          vec4 c = texture(src, uv);  
          c.a *= smoothstep(.5, .499, abs(uv.x - .5)) * smoothstep(.5, .499, abs(uv.y - .5));
          return c;
        }

        vec2 zoom(vec2 uv, float t) {
          return (uv - .5) * t + .5;
        }

        float rand(vec3 p) {
          return fract(sin(dot(p, vec3(829., 4839., 432.))) * 39428.);
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - offset) / resolution;       
          
          vec2 p = uv * 2. - 1.;
          p.x *= resolution.x / resolution.y;
          float l = length(p); 
           
          float dist = pow(l, 2.) * .3;
          dist = smoothstep(0., 1., dist);
          uv = zoom(uv, 0.5 + dist);  
            
          vec2 du = (uv - .5);
          float a = atan(p.y, p.x);
          float rd = rand(vec3(a, time, 0));
          uv = (uv - .5) * (1.0 + rd * pow(l * 0.7, 3.) * 0.3) + .5;
            
          vec2 uvr = uv;
          vec2 uvg = uv;
          vec2 uvb = uv;
            
          float d = (1. + sin(uv.y * 20. + time * 3.) * 0.1) * 0.05;
          uvr.x += 0.0015;
          uvb.x -= 0.0015;
          uvr = zoom(uvr, 1. + d * l * l);
          uvb = zoom(uvb, 1. - d * l * l);    
            
          vec4 cr = readTex(uvr);
          vec4 cg = readTex(uvg);
          vec4 cb = readTex(uvb);  
          
          outColor = vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 1.);
          
          vec4 deco;
          float res = resolution.y;
          deco += (
            sin(uv.y * res * .7 + time * 100.) *
            sin(uv.y * res * .3 - time * 130.)
          ) * 0.05;
          deco += smoothstep(.01, .0, min(fract(uv.x * 20.), fract(uv.y * 20.))) * 0.1;
          outColor += deco * smoothstep(2., 0., l);
          
          outColor *= 1.8 - l * l;  
          outColor += rand(vec3(p, time)) * 0.1;     
        }
      `;

      const shader2 = `
        precision highp float;
        uniform sampler2D src;
        uniform vec2 offset;
        uniform vec2 resolution;
        uniform float time;
        uniform float id;
        out vec4 outColor;

        vec4 readTex(vec2 uv) {  
          vec4 c = texture(src, uv);  
          c.a *= smoothstep(.5, .499, abs(uv.x - .5)) * smoothstep(.5, .499, abs(uv.y - .5));
          return c;
        }

        float rand(vec2 p) {
          return fract(sin(dot(p, vec2(829., 483.))) * 394.);
        }

        float rand(vec3 p) {
          return fract(sin(dot(p, vec3(829., 4839., 432.))) * 39428.);
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - offset) / resolution;
          vec2 uvr = uv, uvg = uv, uvb = uv;
          float r = rand(vec2(floor(time * 43.), id));
          
          if (r > 0.8) {
            float y = sin(floor(uv.y / 0.07)) + sin(floor(uv.y / 0.003 + time));
            float f = rand(vec2(y, floor(time * 5.0) + id)) * 2. - 1.;
            uvr.x += f * 0.1;
            uvg.x += f * 0.2;
            uvb.x += f * 0.3;
          }
          
          float r2 = rand(vec2(floor(time * 37.), id + 10.));
          if (r2 > 0.9) {
            uvr.x += sin(uv.y * 7. + time + id + 1.) * 0.03;
            uvg.x += sin(uv.y * 5. + time + id + 2.) * 0.03;
            uvb.x += sin(uv.y * 3. + time + id + 3.) * 0.03;
          }
          
          vec4 cr = readTex(uvr);
          vec4 cg = readTex(uvg);
          vec4 cb = readTex(uvb);  
          
          outColor = vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 1.);
        }
      `;

      this.vfx = new VFX({ 
        scrollPadding: false,
        postEffect: { shader } 
      });

      // Apply VFX to reality section elements
      let i = 0;
      const realityElements = document.querySelectorAll('.reality-img, .reality-title, .reality-subtitle, .reality-text');
      for (const element of realityElements) {
        await this.vfx.add(element, { 
          shader: shader2,
          uniforms: { id: i++ }
        });
      }

      this.initialized = true;
    } catch (error) {
      console.warn('VFX initialization failed:', error);
    }
  }
}

// ================================
// SCROLL TRANSITION MANAGER
// ================================
class ScrollManager {
  constructor() {
    this.distortedSection = document.querySelector('.distorted-section');
    this.portfolioSection = document.querySelector('.portfolio-section');
    this.transitionElement = document.querySelector('.transition-element');
    this.isInPortfolio = false;
  }

  initialize() {
    this.setupScrollTriggers();
    this.setupSmoothTransition();
  }

  setupScrollTriggers() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Animate reality section elements on scroll
    gsap.timeline({
      scrollTrigger: {
        trigger: '.distorted-section',
        start: 'top center',
        end: 'bottom center',
        scrub: 1
      }
    })
    .to('.reality-title, .reality-subtitle, .reality-text, .reality-img', {
      opacity: 1,
      stagger: 0.2,
      duration: 1
    });

    // Hide transition indicator when reaching portfolio
    ScrollTrigger.create({
      trigger: '.portfolio-section',
      start: 'top bottom',
      onEnter: () => {
        this.isInPortfolio = true;
        gsap.to('.transition-element', { opacity: 0, duration: 0.5 });
      },
      onLeaveBack: () => {
        this.isInPortfolio = false;
        gsap.to('.transition-element', { opacity: 0.7, duration: 0.5 });
      }
    });
  }

  setupSmoothTransition() {
    // Add click handler for transition element
    if (this.transitionElement) {
      this.transitionElement.addEventListener('click', () => {
        this.portfolioSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      });
    }
  }
}

// ================================
// PORTFOLIO ANIMATION MANAGER
// ================================
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

    // Add container mouse leave event
    const container = document.querySelector(".portfolio-container");
    if (container) {
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

    const handleMouseEnter = () => {
      this.stopIdleAnimation();
      this.stopIdleTimer();
      this.isIdle = false;

      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      if (this.currentActiveIndex === index) return;

      this.updateActiveStates(index);

      // Animate text with scramble effect
      textElements.forEach((element, i) => {
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
      });

      if (imageUrl) {
        this.showBackgroundImage(imageUrl);
      }
    };

    const handleMouseLeave = () => {
      this.debounceTimeout = setTimeout(() => {
        textElements.forEach((element, i) => {
          gsap.killTweensOf(element);
          element.textContent = originalTexts[i];
        });
      }, 50);
    };

    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
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
        gsap.killTweensOf(element);
        element.textContent = originalTexts[i];
      });
    });

    this.startIdleTimer();
  }

  showBackgroundImage(imageUrl) {
    if (!this.backgroundImage) return;

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
    if (this.backgroundImage) {
      this.backgroundImage.style.opacity = "0";
    }
  }

  startIdleTimer() {
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
    if (this.idleAnimation) return;

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
      gsap.set([...document.querySelectorAll(".project-data")], {
        opacity: 1
      });
      
      this.projectItems.forEach((item) => {
        item.classList.remove("counter-hidden");
      });
    }
  }
}

// ================================
// TIME DISPLAY CLASS
// ================================
class TimeDisplay {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      console.warn(`Element with id '${elementId}' not found.`);
      return;
    }
  }

  start() {
    if (!this.element) return;
    this.updateDisplay();
    setInterval(() => this.updateDisplay(), CONFIG.timeUpdateInterval);
  }

  updateDisplay() {
    if (!this.element) return;
    
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

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize VFX Manager for distortion effects
  const vfxManager = new VFXManager();
  await vfxManager.initialize();

  // Initialize Scroll Manager for smooth transitions
  const scrollManager = new ScrollManager();
  scrollManager.initialize();

  // Initialize Animation Manager for portfolio effects
  const animationManager = new AnimationManager();
  animationManager.initializeAnimations();

  // Initialize Time Display
  const timeDisplay = new TimeDisplay("current-time");
  timeDisplay.start();
});

// ================================
// WINDOW LOAD EVENT
// ================================
window.addEventListener('load', () => {
  // Additional initialization if needed
  console.log('Distorted Reality Portfolio loaded successfully');
});