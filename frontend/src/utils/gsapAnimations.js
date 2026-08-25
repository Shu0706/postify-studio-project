import { gsap } from 'gsap';

// Basic GSAP Animation Functions
export const gsapAnimations = {
  // Fade animations
  fadeIn: (element, duration = 1, delay = 0) => {
    return gsap.fromTo(element, 
      { opacity: 0 },
      { opacity: 1, duration, delay, ease: "power2.out" }
    );
  },

  fadeOut: (element, duration = 1, delay = 0) => {
    return gsap.to(element, {
      opacity: 0,
      duration,
      delay,
      ease: "power2.out"
    });
  },

  // Slide animations
  slideUp: (element, duration = 1, delay = 0, distance = 60) => {
    return gsap.fromTo(element,
      { y: distance, opacity: 0 },
      { y: 0, opacity: 1, duration, delay, ease: "power3.out" }
    );
  },

  slideDown: (element, duration = 1, delay = 0, distance = 60) => {
    return gsap.fromTo(element,
      { y: -distance, opacity: 0 },
      { y: 0, opacity: 1, duration, delay, ease: "power3.out" }
    );
  },

  slideLeft: (element, duration = 1, delay = 0, distance = 60) => {
    return gsap.fromTo(element,
      { x: distance, opacity: 0 },
      { x: 0, opacity: 1, duration, delay, ease: "power3.out" }
    );
  },

  slideRight: (element, duration = 1, delay = 0, distance = 60) => {
    return gsap.fromTo(element,
      { x: -distance, opacity: 0 },
      { x: 0, opacity: 1, duration, delay, ease: "power3.out" }
    );
  },

  // Scale animations
  scaleIn: (element, duration = 1, delay = 0) => {
    return gsap.fromTo(element,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration, delay, ease: "back.out(1.7)" }
    );
  },

  scaleOut: (element, duration = 1, delay = 0) => {
    return gsap.to(element, {
      scale: 0,
      opacity: 0,
      duration,
      delay,
      ease: "back.in(1.7)"
    });
  },

  // Rotation animations
  rotateIn: (element, duration = 1, delay = 0) => {
    return gsap.fromTo(element,
      { rotation: -180, opacity: 0 },
      { rotation: 0, opacity: 1, duration, delay, ease: "power2.out" }
    );
  },

  // Complex animations
  bounceIn: (element, duration = 1.5, delay = 0) => {
    return gsap.fromTo(element,
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration, 
        delay, 
        ease: "elastic.out(1, 0.3)" 
      }
    );
  },

  rubberBand: (element, duration = 1, delay = 0) => {
    return gsap.fromTo(element,
      { scaleX: 1, scaleY: 1 },
      {
        scaleX: 1.25,
        scaleY: 0.75,
        duration: duration * 0.3,
        delay,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.to(element, {
            scaleX: 1,
            scaleY: 1,
            duration: duration * 0.4,
            ease: "elastic.out(1, 0.3)"
          });
        }
      }
    );
  },

  // Hover effects
  hoverScale: (element, scale = 1.1) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { scale, duration: 0.3, ease: "power2.out" });
    return tl;
  },

  hoverLift: (element, y = -10) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { y, duration: 0.3, ease: "power2.out" });
    return tl;
  },

  hoverGlow: (element, glowColor = "rgba(59, 130, 246, 0.5)") => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, {
      boxShadow: `0 0 30px ${glowColor}`,
      duration: 0.3,
      ease: "power2.out"
    });
    return tl;
  },

  // Stagger animations
  staggerFadeIn: (elements, duration = 1, stagger = 0.1) => {
    return gsap.fromTo(elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: "power3.out"
      }
    );
  },

  staggerSlideUp: (elements, duration = 1, stagger = 0.1, distance = 60) => {
    return gsap.fromTo(elements,
      { y: distance, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease: "power3.out"
      }
    );
  },

  // Infinite animations
  float: (element, amplitude = 10, duration = 3) => {
    return gsap.to(element, {
      y: -amplitude,
      duration: duration / 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  },

  pulse: (element, scale = 1.1, duration = 2) => {
    return gsap.to(element, {
      scale,
      duration: duration / 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  },

  rotate: (element, rotation = 360, duration = 4) => {
    return gsap.to(element, {
      rotation,
      duration,
      ease: "none",
      repeat: -1
    });
  },

  // Loading animations
  spinner: (element, duration = 1) => {
    return gsap.to(element, {
      rotation: 360,
      duration,
      ease: "none",
      repeat: -1
    });
  },

  // Page transitions
  pageSlideIn: (element, direction = 'left', duration = 0.8) => {
    const x = direction === 'left' ? -window.innerWidth : window.innerWidth;
    return gsap.fromTo(element,
      { x, opacity: 0 },
      { x: 0, opacity: 1, duration, ease: "power3.out" }
    );
  },

  pageSlideOut: (element, direction = 'right', duration = 0.8) => {
    const x = direction === 'right' ? window.innerWidth : -window.innerWidth;
    return gsap.to(element, {
      x,
      opacity: 0,
      duration,
      ease: "power3.in"
    });
  },

  // Complex timeline animations
  cardReveal: (element, duration = 1.5) => {
    const tl = gsap.timeline();
    tl.fromTo(element,
      { scale: 0.8, opacity: 0, rotationY: -90 },
      { scale: 1, opacity: 1, duration: duration * 0.6, ease: "power2.out" }
    ).to(element,
      { rotationY: 0, duration: duration * 0.4, ease: "power2.out" },
      "-=0.3"
    );
    return tl;
  },

  textReveal: (element, duration = 1) => {
    const tl = gsap.timeline();
    tl.fromTo(element,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: "power3.out", stagger: 0.1 }
    );
    return tl;
  },

  morphingButton: (element, duration = 0.5) => {
    const tl = gsap.timeline();
    tl.to(element, {
      borderRadius: "50px",
      scaleX: 1.1,
      duration: duration / 2,
      ease: "power2.out"
    }).to(element, {
      borderRadius: "8px",
      scaleX: 1,
      duration: duration / 2,
      ease: "power2.out"
    });
    return tl;
  }
};

// Utility functions
export const createTimeline = (options = {}) => {
  return gsap.timeline(options);
};

export const killAll = () => {
  gsap.killTweensOf("*");
};

export const setDefaults = (duration = 1, ease = "power2.out") => {
  gsap.defaults({ duration, ease });
};

// Scroll-triggered animations (requires ScrollTrigger plugin)
export const scrollAnimations = {
  fadeInOnScroll: (element, trigger = element, start = "top 80%") => {
    return gsap.fromTo(element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger,
          start,
          toggleActions: "play none none reverse"
        }
      }
    );
  },

  scaleOnScroll: (element, trigger = element, start = "top 80%") => {
    return gsap.fromTo(element,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger,
          start,
          toggleActions: "play none none reverse"
        }
      }
    );
  },

  parallax: (element, speed = 0.5) => {
    return gsap.fromTo(element,
      { y: 0 },
      {
        y: () => -(element.offsetHeight * speed),
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }
};

// Cleanup function
export const cleanup = () => {
  gsap.killTweensOf("*");
  if (window.ScrollTrigger) {
    window.ScrollTrigger.killAll();
  }
};

export default gsapAnimations;
